import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { PartieManagerService } from '../../services/partie-manager.service';
import { CasePlateau } from '../../models/case-plateau.model';
import { JoueurPartie } from "../../models/joueur-partie.model";
import { Partie } from "../../models/partie.model";
import { Pion, EtatPion } from "../../models/pion.model";

interface JoueurInit {
  pseudo: string;
  couleur: 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';
  id?: number;
}

@Component({
  selector: 'app-plateau',
  templateUrl: './plateau.component.html',
  styleUrls: ['./plateau.component.scss']
})
export class PlateauComponent implements OnInit {
  cases: CasePlateau[] = [];
  lignes: CasePlateau[][] = [];
  casesAffichees: CasePlateau[] = [];

  listeCasesSequence: { [key: string]: CasePlateau[] } = {};
  pions: Pion[] = [];
  joueursInit: JoueurInit[] = [
    { pseudo: '', couleur: 'ROUGE' },
    { pseudo: '', couleur: 'BLEU' },
    { pseudo: '', couleur: 'VERT' },
    { pseudo: '', couleur: 'JAUNE' }
  ];

  partieCreee = false;
  pionColor: 'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE' = 'VERT';
  colors: Array<'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE'> = ['VERT', 'ROUGE', 'BLEU', 'JAUNE'];
  diceValue = 0;
  isRolling = false;

  joueursPartie: JoueurPartie[] = [];
  partie: Partie | null = null;
  showRules = false;

  constructor(
    private caseService: CasePlateauService,
    private PartieManagerService: PartieManagerService
  ) {}

  ngOnInit(): void {
    this.caseService.getAll().subscribe({
      next: (data) => {
        this.cases = data;
        this.lignes = this.generateGrille(data);
        this.casesAffichees = this.lignes.flat();
        this.listeCasesSequence = this.genererListeSequence(data);
        this.restorePionsFromStorage();
      },
      error: (err) => console.error('Erreur chargement plateau:', err)
    });
  }

  /** ==================== Partie / Joueurs / Pions ==================== */

  startPartie() {
    const pseudos = this.joueursInit.map(j => j.pseudo.trim());
    const couleurs = this.joueursInit.map(j => j.couleur);

    if (pseudos.some(p => !p)) {
      alert('Tous les pseudos doivent être remplis !');
      return;
    }

    // Crée la partie complète
    this.PartieManagerService.createPartieComplete(pseudos, couleurs)
      .subscribe({
        next: (result) => {
          console.log('Partie complète créée', result);
          this.partie = result.partie;
          this.joueursPartie = result.joueursPartie;
          this.pions = result.pions;
          this.partieCreee = true;
          this.savePionsToStorage();
        },
        error: (err) => {
          console.error('Erreur création partie', err);
          alert('Impossible de créer la partie');
        }
      });
  }

  /** ==================== Déplacement des pions ==================== */

  rollDice() {
    if (this.isRolling) return;
    this.isRolling = true;
    this.diceValue = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      const pion = this.pions.find(p => p.joueurPartie?.couleur === this.pionColor);
      console.log("valeur dé pour:",pion?.joueurPartie?.couleur,"=",this.diceValue);
      if (pion) this.movePion(pion, this.diceValue);

      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
    }, 1000);
  }

  switchPion() {
    const colors: ('VERT' | 'ROUGE' | 'BLEU' | 'JAUNE')[] = ['VERT', 'ROUGE', 'BLEU', 'JAUNE'];
    const currentIndex = colors.indexOf(this.pionColor);
    this.pionColor = colors[(currentIndex + 1) % 4];
  }

  movePion(pion: Pion, steps: number) {
    const couleur = pion.joueurPartie!.couleur;
    const sequence = this.listeCasesSequence[couleur];
    if (!sequence || sequence.length === 0) return;

    // Sortie de l'écurie
    if (pion.etatPion === 'ECURIE') {
      if (steps === 6) {
        pion.etatPion = 'EN_JEU';
        const caseDepart = sequence.find(c => c.position === 1 && c.couleur === couleur);
        console.log("caseDepart trouvé:",caseDepart)
        if (caseDepart) {
          pion.casePlateau = caseDepart.idCase;
          console.log('Pion sorti de l\'écurie:', pion);
        } else {
          console.error('Pas de case de départ trouvée pour couleur', couleur, sequence);
        }
      }
      return;
    }

    // Index actuel
    let idx = sequence.findIndex(c => c.idCase === pion.casePlateau);
    if (idx < 0) return;

    const currentCase = sequence[idx];

    // Échelle
    if (currentCase.position === 14 && currentCase.couleur === couleur) {
      console.log("le pion ",pion.joueurPartie?.couleur, " est sur l arrivee");
      if (steps === 1) {
        const nextIndex = sequence.findIndex(c => c.couleur === couleur && c.position === 16);
        if (nextIndex >= 0) idx = nextIndex;
      }
      pion.casePlateau = sequence[idx].idCase;
      return;
    }

    if (currentCase.position >= 16 && currentCase.position <= 21 && currentCase.couleur === couleur) {
      console.log("le pion ",pion.joueurPartie?.couleur, " est sur l echelle. position",pion.CasePlateau?.position);
      const nextPosition = currentCase.position + 1;
      const requiredRoll = nextPosition - 15;
      if (steps === requiredRoll) {
        const nextIndex = sequence.findIndex(c => c.couleur === couleur && c.position === nextPosition);
        if (nextIndex >= 0) idx = nextIndex;
      }
      pion.casePlateau = sequence[idx].idCase;
      return;
    }

    // Avancée normale
    for (let i = 0; i < steps; i++) {
      if (idx < sequence.length - 1) {
        const nextCase = sequence[idx + 1];
        if (nextCase.position === 14 && nextCase.couleur === couleur) {
          idx++;
          pion.etatPion = 'ARRIVE';
          break;
        }
        idx++;
      }
    }

    pion.CasePlateau = sequence[idx];
    pion.casePlateau = sequence[idx].idCase;
    console.log("le pion ",pion.joueurPartie?.couleur, " est maintenant sur la case:",pion.CasePlateau?.position, " de couleur:", pion.CasePlateau?.couleur);
  }

  /** ==================== Séquences et plateau ==================== */

  private genererListeSequence(cases: CasePlateau[]): { [key: string]: CasePlateau[] } {
    const sequences: { [key: string]: CasePlateau[] } = { VERT: [], ROUGE: [], BLEU: [], JAUNE: [] };
    const home = [16, 17, 18, 19, 20, 21];


    const add = (color: string, positions: number[], targetColor?: string) => {
      const c = targetColor || color;
      sequences[color].push(
        ...cases
          .filter(cas => cas.couleur === c && positions.includes(cas.position))
          .sort((a, b) => positions.indexOf(a.position) - positions.indexOf(b.position))
      );
    };


    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'ROUGE');
    add('ROUGE', [14], 'VERT');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'VERT');
    add('ROUGE', [14], 'JAUNE');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('ROUGE', [14], 'BLEU');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('ROUGE', [14], 'ROUGE');
    add('ROUGE', home, 'ROUGE');


    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'VERT');
    add('VERT', [14], 'JAUNE');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('VERT', [14], 'BLEU');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('VERT', [14], 'ROUGE');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'ROUGE');
    add('VERT', [14], 'VERT');
    add('VERT', home, 'VERT');

    add('JAUNE', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('JAUNE', [14], 'BLEU');
    add('JAUNE', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('JAUNE', [14], 'ROUGE');
    add('JAUNE', Array.from({ length: 13 }, (_, i) => i + 1), 'ROUGE');
    add('JAUNE', [14], 'VERT');
    add('JAUNE', Array.from({ length: 13 }, (_, i) => i + 1), 'VERT');
    add('JAUNE', [14], 'JAUNE');
    add('JAUNE', home, 'JAUNE');

    add('BLEU', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('BLEU', [14], 'ROUGE');
    add('BLEU', Array.from({ length: 13 }, (_, i) => i + 1), 'ROUGE');
    add('BLEU', [14], 'VERT');
    add('BLEU', Array.from({ length: 13 }, (_, i) => i + 1), 'VERT');
    add('BLEU', [14], 'JAUNE');
    add('BLEU', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('BLEU', [14], 'BLEU');
    add('BLEU', home, 'BLEU');

    return sequences;
  }



  generateGrille(cases: CasePlateau[]): CasePlateau[][] {
    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

    lignes.push([ ...Array(6).fill(find('JAUNE', 15)), find('JAUNE', 13), find('BLEU', 14), find('BLEU', 1), ...Array(6).fill(find('BLEU', 15)) ]);

    let jaunePosition = 12, bleuPosition1 = 16, bleuPosition2 = 2;
    for (let i = 1; i <= 5; i++) {
      lignes.push([ ...Array(6).fill(find('JAUNE', 15)), find('JAUNE', jaunePosition), find('BLEU', bleuPosition1), find('BLEU', bleuPosition2), ...Array(6).fill(find('BLEU', 15)) ]);
      jaunePosition--; bleuPosition1++; bleuPosition2++;
    }

    lignes.push([ ...Array.from({ length: 7 }, (_, i) => find('JAUNE', i + 1)), find('BLEU', 21), ...Array.from({ length: 7 }, (_, i) => find('BLEU', i + 7)) ]);
    lignes.push([ find('JAUNE', 14), ...Array.from({ length: 6 }, (_, i) => find('JAUNE', i + 16)), find('BLEU', 22), ...Array.from({ length: 6 }, (_, i) => find('ROUGE', 21 - i)), find('ROUGE', 14) ]);
    lignes.push([ ...Array.from({ length: 7 }, (_, i) => find('VERT', 13 - i)), find('VERT', 21), ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7 - i)) ]);

    let vertPosition1 = 6, vertPosition2 = 20, rougePosition = 8;
    for (let i = 1; i <= 5; i++) {
      lignes.push([ ...Array(6).fill(find('VERT', 15)), find('VERT', vertPosition1), find('VERT', vertPosition2), find('ROUGE', rougePosition), ...Array(6).fill(find('ROUGE', 15)) ]);
      vertPosition1--; vertPosition2--; rougePosition++;
    }

    lignes.push([ ...Array(6).fill(find('VERT', 15)), find('VERT', 1), find('VERT', 14), find('ROUGE', 13), ...Array(6).fill(find('ROUGE', 15)) ]);

    return lignes;
  }


  /** ==================== LocalStorage ==================== */

  /**
   * Sauvegarde les pions dans le localStorage.
   * On ne garde que les informations essentielles : id, casePlateau, etatPion, couleur, joueurPartieId
   */
  private savePionsToStorage() {
    const toSave = this.pions.map(p => ({
      idPion: p.idPion,
      casePlateau: p.casePlateau,
      etatPion: p.etatPion,
      couleur: p.joueurPartie?.couleur, // stocke la couleur directement
      joueurPartieId: p.joueurPartie?.id
    }));
    localStorage.setItem('pions', JSON.stringify(toSave));
  }

  /**
   * Restaure les pions depuis le localStorage.
   * Reconstruit la structure minimale de joueurPartie pour que getPionImgForCase fonctionne.
   */
  private restorePionsFromStorage() {
    const saved = localStorage.getItem('pions');
    if (!saved) return;

    const parsed: Array<{
      idPion?: number;
      casePlateau?: number | null;
      etatPion: EtatPion;
      couleur?: 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';
      joueurPartieId?: number;
    }> = JSON.parse(saved);

    this.pions = parsed.map(p => ({
      idPion: p.idPion,
      casePlateau: p.casePlateau,
      etatPion: p.etatPion,
      idJoueurPartie: p.joueurPartieId!,
      joueurPartie: p.couleur
        ? { id: p.joueurPartieId!, couleur: p.couleur }
        : undefined
    }));
  }

  restartPions() {
    this.pions.forEach(p => {
      p.etatPion = 'ECURIE';
      p.casePlateau = null;
    });
    this.savePionsToStorage();
  }

  /** ==================== Helpers ==================== */

  getPionCase(color: 'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE'): CasePlateau | undefined {
    // Cherche le pion correspondant à cette couleur
    const pion = this.pions.find(p => p.joueurPartie?.couleur === color);
    if (!pion || pion.etatPion === 'ECURIE') return undefined;

    return this.listeCasesSequence[color]?.find(c => c.idCase === pion.casePlateau);
  }

  getPionImgForCase(c: CasePlateau): { src: string; alt: string }[] {
    if (!this.pions|| c.typeCase=="ECURIE") return [];

    return this.pions
      .filter(p => p.casePlateau === c.idCase && p.etatPion !== 'ECURIE')
      .map(p => ({
        src: `../../assets/Pion_${p.joueurPartie?.couleur.toLowerCase()}.png`,
        alt: `pion ${p.joueurPartie?.couleur}`
      }));
  }




  toggleRules() {
    this.showRules = !this.showRules;
  }

  getPionPath(color: 'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE'): string {
    const sequence = this.listeCasesSequence[color];
    if (!sequence) return '';
    return sequence.map(c => `${c.couleur[0]}${c.position}`).join(' → ');
  }
}
