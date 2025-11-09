import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { PartieManagerService } from '../../services/partie-manager.service';
import { CasePlateau } from '../../models/case-plateau.model';
import { JoueurPartie } from "../../models/joueur-partie.model";
import { Partie } from "../../models/partie.model";
import { Pion, EtatPion } from "../../models/pion.model";
import { JoueurPartieService } from "../../services/joueur-partie.service";

interface JoueurInit {
  pseudo: string;
  couleur: 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';
  id?: number;
}

interface Classement {
  pseudo: string;
  couleur: 'ROUGE' | 'BLEU' | 'VERT' | 'JAUNE';
  position: number;
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

  partieCree = false;
  pionColor: 'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE' = 'VERT';
  colors: Array<'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE'> = ['VERT', 'ROUGE', 'BLEU', 'JAUNE'];
  diceValue = 0;
  isRolling = false;

  joueursPartie: JoueurPartie[] = [];
  partie: Partie | null = null;

  showRules = false;
  showVictoryModal = false;
  classementFinal: Classement[] = [];

  constructor(
    private caseService: CasePlateauService,
    private PartieManagerService: PartieManagerService,
    private joueurPartieService: JoueurPartieService
  ) {}

  /** =============================================
   * INIT
   =============================================== */

  ngOnInit(): void {
    this.restorePlayersInit();
    this.restoreGameState();

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

  /** =============================================
   * CACHE SYSTEM
   =============================================== */

  private savePlayersInit() {
    localStorage.setItem('joueursInit', JSON.stringify(this.joueursInit));
  }

  private restorePlayersInit() {
    const saved = localStorage.getItem('joueursInit');
    if (saved) {
      this.joueursInit = JSON.parse(saved);
    }
  }

  private saveGameState() {
    if (this.partie) {
      localStorage.setItem('partie', JSON.stringify(this.partie));
    }
    localStorage.setItem('joueursPartie', JSON.stringify(this.joueursPartie));
    localStorage.setItem('pionColor', this.pionColor);
  }

  private restoreGameState() {
    const partieLS = localStorage.getItem('partie');
    const joueursPartieLS = localStorage.getItem('joueursPartie');
    const pionColorLS = localStorage.getItem('pionColor');

    if (partieLS && joueursPartieLS) {
      this.partie = JSON.parse(partieLS);
      this.joueursPartie = JSON.parse(joueursPartieLS);
      this.pionColor = (pionColorLS as any) || 'VERT';
      this.partieCree = true;
    }
  }

  private savePionsToStorage() {
    const toSave = this.pions.map(p => ({
      idPion: p.idPion,
      casePlateau: p.casePlateauID,
      etatPion: p.etatPion,
      couleur: p.joueurPartie?.couleur,
      joueurPartieId: p.joueurPartie?.id
    }));
    localStorage.setItem('pions', JSON.stringify(toSave));
  }

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
      casePlateauID: p.casePlateau,
      etatPion: p.etatPion,
      idJoueurPartie: p.joueurPartieId!,
      joueurPartie: p.couleur
        ? { id: p.joueurPartieId!, couleur: p.couleur }
        : undefined
    }));
  }

  /** =============================================
   * CREATE PARTIE
   =============================================== */

  startPartie() {
    const pseudos = this.joueursInit.map(j => j.pseudo.trim());
    const couleurs = this.joueursInit.map(j => j.couleur);

    if (pseudos.some(p => !p)) {
      alert('Tous les pseudos doivent être remplis !');
      return;
    }

    this.PartieManagerService.createPartieComplete(pseudos, couleurs)
      .subscribe({
        next: (result) => {
          this.partie = result.partie;
          this.joueursPartie = result.joueursPartie;
          this.pions = result.pions;
          this.partieCree = true;

          this.savePlayersInit();
          this.saveGameState();
          this.savePionsToStorage();
        },
        error: (err) => {
          console.error('Erreur création partie', err);
          alert('Impossible de créer la partie');
        }
      });
  }

  /** =============================================
   * DICE & TURN
   =============================================== */

  rollDice() {
    if (this.isRolling) return;

    this.isRolling = true;
    this.diceValue = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      const pion = this.pions.find(p => p.joueurPartie?.couleur === this.pionColor);
      if (pion) this.movePion(pion, this.diceValue);

      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
      this.saveGameState();
    }, 1000);
  }

  rollDiceTest() {
    if (this.isRolling) return;
    this.isRolling = true;

    const pion = this.pions.find(p => p.joueurPartie?.couleur === this.pionColor);
    if (!pion) {
      this.isRolling = false;
      return;
    }

    let valeur = 6;

    const currentCase = this.listeCasesSequence[this.pionColor].find(c => c.idCase === pion.casePlateauID);
    if (pion.etatPion === 'ECURIE') {
      valeur = 6;
    } else if (currentCase) {
      const pos = currentCase.position;
      if (pos === 14) valeur = 1;
      else if (pos >= 16 && pos <= 20) valeur = pos - 14;
      else valeur = 6;
    }

    this.diceValue = valeur;

    setTimeout(() => {
      if (pion) this.movePion(pion, valeur);

      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
      this.saveGameState();
    }, 500);
  }

  switchPion() {
    const colors = ['VERT', 'JAUNE', 'BLEU', 'ROUGE'] as const;
    const currentIndex = colors.indexOf(this.pionColor);
    this.pionColor = colors[(currentIndex + 1) % 4];

    localStorage.setItem('pionColor', this.pionColor);
  }

  /** =============================================
   * MOVE PION LOGIC
   =============================================== */

  movePion(pion: Pion, steps: number) {
    const couleur = pion.joueurPartie!.couleur;
    const sequence = this.listeCasesSequence[couleur];
    if (!sequence) return;

    if (pion.etatPion === 'ECURIE') {
      if (steps === 6) {
        pion.etatPion = 'EN_JEU';
        const caseDepart = sequence.find(c => c.position === 1 && c.couleur === couleur);
        if (caseDepart) {
          pion.casePlateauID = caseDepart.idCase;
        }
      }
      return;
    }

    let idx = sequence.findIndex(c => c.idCase === pion.casePlateauID);
    if (idx < 0) return;

    const currentCase = sequence[idx];

    if (currentCase.position === 14 && currentCase.couleur === couleur) {
      if (steps === 1) {
        const nextIndex = sequence.findIndex(c => c.position === 16 && c.couleur === couleur);
        if (nextIndex >= 0) idx = nextIndex;
      }
      pion.casePlateauID = sequence[idx].idCase;
      return;
    }

    if (currentCase.position >= 16 && currentCase.position < 21) {
      const nextPosition = currentCase.position + 1;
      const requiredRoll = nextPosition - 15;
      if (steps === requiredRoll) {
        const nextIndex = sequence.findIndex(c => c.position === nextPosition && c.couleur === couleur);
        if (nextIndex >= 0) idx = nextIndex;
      }

      pion.casePlateauID = sequence[idx].idCase;

      if (sequence[idx].position === 21) {
        pion.etatPion = 'ARRIVE';
        const classement = this.PartieManagerService.checkVictory(this.partie!, this.joueursPartie, this.pions, this.listeCasesSequence);
        if (classement) {
          this.afficherEcranVictoire(classement);
        }
      }
      return;
    }

    for (let i = 0; i < steps; i++) {
      if (idx < sequence.length - 1) idx++;
    }

    pion.casePlateauID = sequence[idx].idCase;
    this.savePionsToStorage();
  }

  /** =============================================
   * SEQUENCES / GRILLE
   =============================================== */

  private genererListeSequence(cases: CasePlateau[]): { [key: string]: CasePlateau[] } {
    // (unchanged - your logic)
    // keep your existing implementation
    // […]
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

    // repeat the sequence construction exactly as in your original code
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
    // keep your grid generation unchanged
    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

    lignes.push([
      ...Array(6).fill(find('JAUNE', 15)),
      find('JAUNE', 13),
      find('BLEU', 14),
      find('BLEU', 1),
      ...Array(6).fill(find('BLEU', 15))
    ]);

    let jaunePosition = 12, bleuPosition1 = 16, bleuPosition2 = 2;
    for (let i = 1; i <= 5; i++) {
      lignes.push([
        ...Array(6).fill(find('JAUNE', 15)),
        find('JAUNE', jaunePosition),
        find('BLEU', bleuPosition1),
        find('BLEU', bleuPosition2),
        ...Array(6).fill(find('BLEU', 15))
      ]);
      jaunePosition--; bleuPosition1++; bleuPosition2++;
    }

    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('JAUNE', i + 1)),
      find('BLEU', 21),
      ...Array.from({ length: 7 }, (_, i) => find('BLEU', i + 7))
    ]);

    lignes.push([
      find('JAUNE', 14),
      ...Array.from({ length: 6 }, (_, i) => find('JAUNE', i + 16)),
      find('BLEU', 22),
      ...Array.from({ length: 6 }, (_, i) => find('ROUGE', 21 - i)),
      find('ROUGE', 14)
    ]);

    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('VERT', 13 - i)),
      find('VERT', 21),
      ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7 - i))
    ]);

    let vertPosition1 = 6, vertPosition2 = 20, rougePosition = 8;
    for (let i = 1; i <= 5; i++) {
      lignes.push([
        ...Array(6).fill(find('VERT', 15)),
        find('VERT', vertPosition1),
        find('VERT', vertPosition2),
        find('ROUGE', rougePosition),
        ...Array(6).fill(find('ROUGE', 15))
      ]);
      vertPosition1--; vertPosition2--; rougePosition++;
    }

    lignes.push([
      ...Array(6).fill(find('VERT', 15)),
      find('VERT', 1),
      find('VERT', 14),
      find('ROUGE', 13),
      ...Array(6).fill(find('ROUGE', 15))
    ]);

    return lignes;
  }

  /** =============================================
   * VICTORY
   =============================================== */

  afficherEcranVictoire(classement: { id: number; classement: number }[]) {
    this.classementFinal = [];

    classement.forEach(c => {
      const jp = this.joueursPartie.find(j => j.id === c.id);
      if (!jp) return;

      const entry: Classement = {
        pseudo: 'Chargement...',
        couleur: jp.couleur,
        position: c.classement
      };

      this.classementFinal.push(entry);

      this.joueurPartieService.getById(jp.id).subscribe(joueurPartie => {
        entry.pseudo = joueurPartie.joueur?.pseudo || 'Inconnu';
      });
    });

    this.showVictoryModal = true;
  }

  closeVictoryModal() {
    this.showVictoryModal = false;
    this.partieCree = false;

    this.joueursInit.forEach(j => j.pseudo = '');

    this.pions = [];
    this.joueursPartie = [];
    this.partie = null;

    localStorage.removeItem('joueursInit');
    localStorage.removeItem('partie');
    localStorage.removeItem('joueursPartie');
    localStorage.removeItem('pions');
    localStorage.removeItem('pionColor');
  }

  /** =============================================
   * HELPERS
   =============================================== */

  getPionImgForCase(c: CasePlateau): { src: string; alt: string }[] {
    if (!this.pions || c.typeCase === 'ECURIE') return [];
    return this.pions
      .filter(p => p.casePlateauID === c.idCase && p.etatPion !== 'ECURIE')
      .map(p => ({
        src: `../../assets/Pion_${p.joueurPartie?.couleur.toLowerCase()}.png`,
        alt: `pion ${p.joueurPartie?.couleur}`
      }));
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }

  restartPions() {
    this.pions.forEach(p => {
      p.etatPion = 'ECURIE';
      p.casePlateauID = null;
    });
    this.savePionsToStorage();
  }
}
