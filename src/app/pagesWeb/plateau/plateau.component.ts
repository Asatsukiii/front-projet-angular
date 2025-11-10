import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { PartieManagerService } from '../../services/partie-manager.service';
import { CasePlateau } from '../../models/case-plateau.model';
import { JoueurPartie } from "../../models/joueur-partie.model";
import { Partie } from "../../models/partie.model";
import { Pion, EtatPion } from "../../models/pion.model";
import { JoueurPartieService } from "../../services/joueur-partie.service";


// fichier de gestion de fonctionnement du plateau
// On y retrouve beaucoup de fonctionnalités importantes:
// la gestion de cache (enregistrement du plateau et joueurs en cache, récupération du plateau et joueurs du cache)
// la gestion du dé (pipé ou non pipé)
// la création de la grille en fonctions des cases stockées en base de données
//

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
  // Order: VERT -> JAUNE -> BLEU -> ROUGE
  pionColor: 'VERT' | 'ROUGE' | 'BLEU' | 'JAUNE' = 'VERT';
  colors: Array<'VERT' | 'JAUNE' | 'BLEU' | 'ROUGE'> = ['VERT', 'JAUNE', 'BLEU', 'ROUGE'];
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

  ngOnInit(): void {

    // on récupère les joueurs et l'état plateau à travers de partie, joueur partie et pionColor
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

  /** ==================== Cache (localStorage) ==================== */

  // on enregistre les joueurs dans le local storage
  savePlayersInit() {
    localStorage.setItem('joueursInit', JSON.stringify(this.joueursInit));
  }

  // on récupère les joueurs dans le local storage
  private restorePlayersInit() {
    const saved = localStorage.getItem('joueursInit');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) this.joueursInit = parsed;
      } catch (e) {
        console.warn('Impossible de parser joueursInit depuis localStorage', e);
      }
    }
  }

  // on enregistre l'état du plateau dans le local storage
  private saveGameState() {
    if (this.partie) {
      localStorage.setItem('partie', JSON.stringify(this.partie));
    }
    localStorage.setItem('joueursPartie', JSON.stringify(this.joueursPartie));
    localStorage.setItem('pionColor', this.pionColor);
  }

  // on récupère l'état du plateau dans le local storage
  private restoreGameState() {
    const partieLS = localStorage.getItem('partie');
    const joueursPartieLS = localStorage.getItem('joueursPartie');
    const pionColorLS = localStorage.getItem('pionColor');

    if (partieLS && joueursPartieLS) {
      try {
        this.partie = JSON.parse(partieLS);
        this.joueursPartie = JSON.parse(joueursPartieLS);
        this.pionColor = (pionColorLS as any) || 'VERT';
        this.partieCree = true;
      } catch (e) {
        console.warn('Erreur restoreGameState', e);
      }
    } else {
      if (pionColorLS) {
        this.pionColor = pionColorLS as any;
      }
    }
  }

  // on enregistre les pions dans le local storage
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

  // on récupère les pions dans le local storage
  private restorePionsFromStorage() {
    const saved = localStorage.getItem('pions');
    if (!saved) return;

    try {
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
    } catch (e) {
      console.warn('Impossible de parser pions depuis localStorage', e);
    }
  }

// on reset l'emplacement des pions
  restartPions() {
    this.pions.forEach(p => {
      p.etatPion = 'ECURIE';
      p.casePlateauID = null;
    });
    this.savePionsToStorage();
  }
// on quitte la partie en cours et on peut en recommencer une
  restartPartie() {
    const confirmation = confirm("Voulez-vous vraiment redémarrer la partie ?\nCela supprimera les données sauvegardées.");

    if (!confirmation) return;

    this.partieCree = false;
    this.joueursInit.forEach(j => j.pseudo = '');
    this.pions = [];
    this.joueursPartie = [];
    this.partie = null;
    this.pionColor = 'VERT';
    this.diceValue = 0;
    this.isRolling = false;


    localStorage.removeItem('pions');
    localStorage.removeItem('partie');
    localStorage.removeItem('joueursPartie');
    localStorage.removeItem('pionColor');
    localStorage.removeItem('joueursInit');


    alert("La partie a été réinitialisée.");
  }

  /** ==================== Partie / Joueurs / Pions ==================== */

  // Fonction de gestion de la page de début de partie.
  // La fonction récupère les pseudos après verification simple (pas de doublon et tous remplis)
  // elle appelle les fonctions permettant de créer la partie complète à partir des pseudos et couleurs
  startPartie() {
    const pseudos = this.joueursInit.map(j => j.pseudo.trim());
    const couleurs = this.joueursInit.map(j => j.couleur);

    if (pseudos.some(p => !p)) {
      alert('Tous les pseudos doivent être remplis !');
      return;
    }

    const pseudosUniques = new Set(pseudos);
    if (pseudosUniques.size !== pseudos.length) {
      alert('Chaque joueur doit avoir un pseudo unique !');
      return;
    }

    this.PartieManagerService.createPartieComplete(pseudos, couleurs)
      .subscribe({
        next: (result) => {
          console.log('Partie complète créée', result);
          this.partie = result.partie;
          this.joueursPartie = result.joueursPartie;
          this.pions = result.pions;
          this.partieCree = true;


          this.savePlayersInit();
          this.saveGameState();
          this.savePionsToStorage();

          if (result.createdPlayers && result.createdPlayers.length > 0) {
            alert(
              'Les joueurs suivants n’existaient pas et ont été créés :\n\n' +
              result.createdPlayers.join('\n')
            );
          }
        },
        error: (err) => {
          console.error('Erreur création partie', err);
          alert('Impossible de créer la partie');
        }
      });
  }

  /** ==================== Déplacement des pions ==================== */

  // Fonction permettant de faire rouler le dé. retourne un nombre aléatoire entre 1 et 6
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
      this.saveGameState();
    }, 1000);
  }

  // Fonction du dé pipé. fait 6 tant que le pion n'est pas sur l'arrivé de sa couleur.
  // une fois sur son arrivée il fait 1, 2, 3, 4, 5, 6 pour monter l'échelle.
  rollDiceTest() {
    if (this.isRolling) return;
    this.isRolling = true;

    const pion = this.pions.find(p => p.joueurPartie?.couleur === this.pionColor);
    if (!pion) {
      console.warn("Aucun pion trouvé pour", this.pionColor);
      this.isRolling = false;
      return;
    }

    let valeur = 6;

    if (pion.etatPion === 'ECURIE') {
      valeur = 6;
    }
    else {
      const caseCourante = this.listeCasesSequence[this.pionColor].find(c => c.idCase === pion.casePlateauID);

      if (caseCourante) {
        const pos = caseCourante.position;

        if (pos === 14) valeur = 1;
        else if (pos >= 16 && pos <= 20) valeur = pos - 14;
        else if (pos === 21) valeur = 6;
        else valeur = 6;
      }
    }

    this.diceValue = valeur;
    console.log(` [TEST] Dé pour ${this.pionColor} = ${valeur}`);

    setTimeout(() => {
      if (pion) this.movePion(pion, valeur);

      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
      this.saveGameState();
    }, 500);
  }

  switchPion() {
    const colors: ('VERT' | 'JAUNE' | 'BLEU' | 'ROUGE')[] = ['VERT', 'JAUNE', 'BLEU', 'ROUGE'];
    const currentIndex = colors.indexOf(this.pionColor);
    this.pionColor = colors[(currentIndex + 1) % colors.length];

    localStorage.setItem('pionColor', this.pionColor);
  }


  // fonction de gestion du mouvement du pion
  // pour gérer les mouvements sur un plateau complexe, chaque couleur possède une séquence qui donne son chemin sur les cases du plateau.
  // a chaque tour de cette fonction on récupère la couleur et la séquence associée.
  // les mouvement du pion vont dépendre du type de case sur lequel il se trouve.
  // pour sortir de l'écurie il doit faire un 6
  // une fois sortie il avance du nombre donné par le lancé de dé
  // une fois qu'il a fait un nombre lui permettant d'atteindre sa case arrivé, il s'arrête dessus et n'avance plus
  // il doit alors monter l'échelle en faisant 1, puis 2, 3,... jusqu'a 6 ou il remporte la partie
  // une fois que la partie est remporté par un pion, on appelle la fonction de gestion de victoire et on affiche la fenêtre de victoire
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
          pion.casePlateauID = caseDepart.idCase;
          console.log('Pion sorti de l\'écurie:', pion);
        } else {
          console.error('Pas de case de départ trouvée pour couleur', couleur, sequence);
        }
      }
      return;
    }

    // Index actuel
    let idx = sequence.findIndex(c => c.idCase === pion.casePlateauID);
    if (idx < 0) return;

    const currentCase = sequence[idx];

    // arrivé
    if (currentCase.position === 14 && currentCase.couleur === couleur) {
      console.log("le pion ",pion.joueurPartie?.couleur, " est sur l arrivee");
      if (steps === 1) {
        const nextIndex = sequence.findIndex(c => c.couleur === couleur && c.position === 16);
        if (nextIndex >= 0) idx = nextIndex;
      }
      pion.casePlateauID = sequence[idx].idCase;
      pion.CasePlateau = sequence[idx];
      return;
    }

    //échelle
    if (currentCase.position >= 16 && currentCase.position < 21 && currentCase.couleur === couleur) {

      const nextPosition = currentCase.position + 1;
      const requiredRoll = nextPosition - 15;
      if (steps === requiredRoll) {
        const nextIndex = sequence.findIndex(c => c.couleur === couleur && c.position === nextPosition);
        if (nextIndex >= 0) idx = nextIndex;
      }
      pion.casePlateauID = sequence[idx].idCase;
      pion.CasePlateau = sequence[idx];

      if (sequence[idx].position === 21) {
        pion.etatPion = 'ARRIVE';
        console.log(`${couleur} a terminé la partie !`);
        const classement =this.PartieManagerService.checkVictory(this.partie!, this.joueursPartie, this.pions, this.listeCasesSequence);
        if (classement) {
          this.afficherEcranVictoire(classement);
        }
        return
      }
      console.log("le pion ",pion.joueurPartie?.couleur, " est sur l echelle. position",pion.CasePlateau?.position);
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
    pion.casePlateauID = sequence[idx].idCase;
    console.log("le pion ",pion.joueurPartie?.couleur, " est maintenant sur la case:",pion.CasePlateau?.position, " de couleur:", pion.CasePlateau?.couleur);

  }

  /** ==================== Séquences et plateau ==================== */

  // cette fonction nous permet de générer les séquence pour chaque couleur.
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


  // cette fonction nous permet de générer la grille du jeu à partir des cases données du back
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

  /** ==================== VICTORY ==================== */

  // affichage de l'écran de victoire
  afficherEcranVictoire(classement: { id: number; classement: number }[]) {
    this.classementFinal = [];

    classement.forEach((c) => {
      const jp = this.joueursPartie.find((j) => j.id === c.id);
      if (!jp) return;

      const entry = {
        pseudo: 'Chargement...',
        couleur: jp.couleur,
        position: c.classement
      };
      this.classementFinal.push(entry);

      this.joueurPartieService.getById(jp.id).subscribe((joueurPartie) => {
        entry.pseudo = joueurPartie.joueur?.pseudo || 'Inconnu';
      });
    });

    this.showVictoryModal = true;
  }

  // fonction de fermeture de la fenetre de victoire. on reset la page plateau et on redirige sur la page de début
  closeVictoryModal() {
    this.showVictoryModal = false;

    this.partieCree = false;
    this.joueursInit.forEach(j => j.pseudo = '');
    this.pions = [];
    this.joueursPartie = [];
    this.partie = null;
    localStorage.removeItem('pions');
    localStorage.removeItem('partie');
    localStorage.removeItem('joueursPartie');
    localStorage.removeItem('pionColor');
    localStorage.removeItem('joueursInit');
  }

 // affiche / cache le panel regles sur la page plateau
  toggleRules() {
    this.showRules = !this.showRules;
  }

  // affichage de l'image du pion de la couleur donnée sur la case donnée
  getPionImgForCase(c: CasePlateau): { src: string; alt: string }[] {
    if (!this.pions|| c.typeCase=="ECURIE") return [];

    return this.pions
      .filter(p => p.casePlateauID === c.idCase && p.etatPion !== 'ECURIE')
      .map(p => ({
        src: `../../assets/Pion_${p.joueurPartie?.couleur.toLowerCase()}.png`,
        alt: `pion ${p.joueurPartie?.couleur}`
      }));
  }

}
