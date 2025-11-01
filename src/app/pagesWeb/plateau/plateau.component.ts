import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { CasePlateau } from '../../models/case-plateau.model';

interface PionState {
  index: number;      // current index in the sequence
  onBoard: boolean;   // whether the pion is on the board
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

  // Separate sequences for green and red pions
  listeCasesSequence: { [key: string]: CasePlateau[] } = { VERT: [], ROUGE: [] };

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

  // === Dice roll ===
  rollDice() {
    if (this.isRolling) return;
    this.isRolling = true;

    this.diceValue = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      this.movePion(this.pionColor, this.diceValue);
      this.isRolling = false;
      this.savePionsToStorage();
      this.switchPion();
    }, 1000);
  }

  switchPion() {
    this.pionColor = this.pionColor === 'VERT' ? 'ROUGE' : 'VERT';
  }

  movePion(color: 'VERT' | 'ROUGE', steps: number) {
    const pion = this.pions[color];
    const sequence = this.listeCasesSequence[color];

    if (!pion.onBoard) {
      if (steps === 6) {
        pion.index = 0; // start at first position
        pion.onBoard = true;
      }
      return;
    }

    let idx = pion.index;
    const currentCase = sequence[idx];

    // Ladder logic for positions 16 → 21
    if (currentCase.position >= 16 && currentCase.position <= 21) {
      const requiredRoll = currentCase.position - 15; // 16->1, 17->2, ..., 21->6
      if (steps === requiredRoll && idx < sequence.length - 1) idx++;
      pion.index = idx;
      return;
    }

    // Normal movement along sequence
    for (let i = 0; i < steps; i++) {
      if (idx < sequence.length - 1) idx++;
    }
    pion.index = idx;
  }

  // === LocalStorage ===
  private savePionsToStorage() {
    localStorage.setItem('pionsState', JSON.stringify(this.pions));
  }

  private restorePionsFromStorage() {
    const saved = localStorage.getItem('pionsState');
    if (saved) this.pions = JSON.parse(saved);
  }

  restartPions() {
    for (const key of Object.keys(this.pions)) {
      this.pions[key].index = 0;
      this.pions[key].onBoard = false;
    }
    this.savePionsToStorage();
  }

  // === Sequence generation for green and red pions ===
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

    const home = [16, 17, 18, 19, 20, 21];

    // Green path
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1));
    add('VERT', [14], 'JAUNE');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('VERT', [14], 'BLEU');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('VERT', [14], 'ROUGE');
    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1), 'ROUGE');
    add('VERT', [14], 'VERT');
    add('VERT', home);

    // Red path
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1));
    add('ROUGE', [14], 'VERT');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'VERT');
    add('ROUGE', [14], 'JAUNE');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'JAUNE');
    add('ROUGE', [14], 'BLEU');
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1), 'BLEU');
    add('ROUGE', [14], 'ROUGE');
    add('ROUGE', home);

    return sequences;
  }

  // === Board display ===
  generateGrille(cases: CasePlateau[]): CasePlateau[][] {
    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

    // Example simplified board structure
    lignes.push([ ...Array(6).fill(find('JAUNE', 15)), find('JAUNE', 13), find('BLEU', 14), find('BLEU', 1), ...Array(6).fill(find('BLEU', 15)) ]);

    let jaunePosition = 12, bleuPosition1 = 16, bleuPosition2 = 2;
    for (let i = 1; i <= 5; i++) {
      lignes.push([ ...Array(6).fill(find('JAUNE', 15)), find('JAUNE', jaunePosition), find('BLEU', bleuPosition1), find('BLEU', bleuPosition2), ...Array(6).fill(find('BLEU', 15)) ]);
      jaunePosition--; bleuPosition1++; bleuPosition2++;
    }

    // Rest of the board (simplified)
    return lignes;
  }

  // === Pion position indicator for display ===
  getPionStatus(color: 'VERT' | 'ROUGE'): string {
    const pion = this.pions[color];
    if (!pion.onBoard) return `${color}: Écurie`;
    const currentCase = this.listeCasesSequence[color][pion.index];
    if (!currentCase) return `${color}: ?`;
    if (currentCase.position >= 16) return `${color}: Ladder ${currentCase.position}`;
    return `${color}: ${currentCase.couleur} ${currentCase.position}`;
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }
}
