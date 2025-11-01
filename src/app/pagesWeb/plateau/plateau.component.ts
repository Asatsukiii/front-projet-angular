import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { CasePlateau } from '../../models/case-plateau.model';

interface PionState {
  index: number;
  onBoard: boolean;
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

  // Pions state: green and red
  pions: { [key: string]: PionState } = {
    VERT: { index: 0, onBoard: false },
    ROUGE: { index: 0, onBoard: false }
  };

  pionColor: 'VERT' | 'ROUGE' = 'VERT'; // currently active pion
  diceValue = 0;
  isRolling = false;
  showRules = false;

  constructor(private caseService: CasePlateauService) {}

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

  // === Dice ===
  rollDice() {
    if (this.isRolling) return;
    this.isRolling = true;

    const value = Math.floor(Math.random() * 6) + 1;
    this.diceValue = value;

    setTimeout(() => {
      this.movePion(this.pionColor, value);
      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
    }, 1000);
  }

  switchPion() {
    this.pionColor = this.pionColor === 'VERT' ? 'ROUGE' : 'VERT';
  }

  // === Pion Movement ===
  movePion(color: 'VERT' | 'ROUGE', steps: number) {
    const pion = this.pions[color];
    const sequence = this.listeCasesSequence[color];

    if (!pion.onBoard) {
      if (steps === 6) {
        pion.index = 0; // start at first position (ecurie -> position 1)
        pion.onBoard = true;
      }
      return;
    }

    let currentIndex = pion.index;
    const currentCase = sequence[currentIndex];

    // Ladder logic (positions 16-20)
    const ladderRollMap: Record<number, number> = {16: 1, 17: 2, 18: 3, 19: 4, 20: 5};
    if (currentCase.position >= 16 && currentCase.position <= 20) {
      const requiredRoll = ladderRollMap[currentCase.position];
      if (steps === requiredRoll) {
        pion.index = currentIndex + 1;
      }
      return;
    }

    // Normal movement along sequence
    for (let i = 0; i < steps; i++) {
      if (currentIndex < sequence.length - 1) {
        currentIndex++;
      }
    }
    pion.index = currentIndex;
  }

  // === LocalStorage ===
  private savePionsToStorage() {
    localStorage.setItem('pionsState', JSON.stringify(this.pions));
  }

  private restorePionsFromStorage() {
    const saved = localStorage.getItem('pionsState');
    if (saved) {
      this.pions = JSON.parse(saved);
    }
  }

  restartPions() {
    for (const key of Object.keys(this.pions)) {
      this.pions[key].index = 0;
      this.pions[key].onBoard = false;
    }
    this.savePionsToStorage();
  }

  // === Board generation / Sequences ===
  private genererListeSequence(cases: CasePlateau[]): { [key: string]: CasePlateau[] } {
    const sequences: { [key: string]: CasePlateau[] } = { VERT: [], ROUGE: [] };
    const add = (color: string, positions: number[], targetColor?: string) => {
      const c = targetColor || color;
      sequences[color].push(
        ...cases
          .filter(cas => cas.couleur === c && positions.includes(cas.position))
          .sort((a, b) => positions.indexOf(a.position) - positions.indexOf(b.position))
      );
    };

    const greenLadder = [16, 17, 18, 19, 20, 21];
    const redLadder = [16, 17, 18, 19, 20, 21];

    // --- Green Pion Path ---
    add('VERT', Array.from({length:13}, (_,i)=>i+1));         // green 1-13
    add('VERT', [14], 'JAUNE');                               // yellow 14
    add('VERT', Array.from({length:13}, (_,i)=>i+1), 'JAUNE'); // yellow 1-13
    add('VERT', [14], 'BLEU');                                // blue 14
    add('VERT', Array.from({length:13}, (_,i)=>i+1), 'BLEU');  // blue 1-13
    add('VERT', [14], 'ROUGE');                               // red 14
    add('VERT', Array.from({length:13}, (_,i)=>i+1), 'ROUGE'); // red 1-13
    add('VERT', [14], 'VERT');                                // green 14
    add('VERT', greenLadder);                                 // green ladder

    // --- Red Pion Path ---
    add('ROUGE', Array.from({length:13}, (_,i)=>i+1));         // red 1-13
    add('ROUGE', [14], 'VERT');                                 // green 14
    add('ROUGE', Array.from({length:13}, (_,i)=>i+1), 'VERT'); // green 1-13
    add('ROUGE', [14], 'JAUNE');                                // yellow 14
    add('ROUGE', Array.from({length:13}, (_,i)=>i+1), 'JAUNE'); // yellow 1-13
    add('ROUGE', [14], 'BLEU');                                 // blue 14
    add('ROUGE', Array.from({length:13}, (_,i)=>i+1), 'BLEU'); // blue 1-13
    add('ROUGE', [14], 'ROUGE');                                // red 14
    add('ROUGE', redLadder);                                    // red ladder

    return sequences;
  }

  generateGrille(cases: CasePlateau[]): CasePlateau[][] {
    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

    // Ligne 1 à 6
    for (let i = 0; i < 6; i++) {
      lignes.push([
        ...Array(6).fill(find('JAUNE', 15)),
        find('JAUNE', 13 - i),
        find('BLEU', 14 + i),
        find('BLEU', i + 1),
        ...Array(6).fill(find('BLEU', 15))
      ]);
    }

    // Ligne 7
    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('JAUNE', i + 1)),
      find('BLEU', 21),
      ...Array.from({ length: 7 }, (_, i) => find('BLEU', i + 7))
    ]);

    // Ligne 8
    lignes.push([
      find('JAUNE', 14),
      ...Array.from({ length: 6 }, (_, i) => find('JAUNE', i + 16)),
      find('BLEU', 22),
      ...Array.from({ length: 6 }, (_, i) => find('ROUGE', 21 - i)),
      find('ROUGE', 14)
    ]);

    // Ligne 9
    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('VERT', 13 - i)),
      find('VERT', 21),
      ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7 - i))
    ]);

    // Ligne 10 à 15
    let vertPos1 = 6, vertPos2 = 20, rougePos = 8;
    for (let i = 0; i < 6; i++) {
      lignes.push([
        ...Array(6).fill(find('VERT', 15)),
        find('VERT', vertPos1),
        find('VERT', vertPos2),
        find('ROUGE', rougePos),
        ...Array(6).fill(find('ROUGE', 15))
      ]);
      vertPos1--;
      vertPos2--;
      rougePos++;
    }

    // Ligne 16
    lignes.push([
      ...Array(6).fill(find('VERT', 15)),
      find('VERT', 1),
      find('VERT', 14),
      find('ROUGE', 13),
      ...Array(6).fill(find('ROUGE', 15))
    ]);

    return lignes;
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }
}
