import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { CasePlateau } from '../../models/case-plateau.model';

@Component({
  selector: 'app-plateau',
  templateUrl: './plateau.component.html',
  styleUrls: ['./plateau.component.scss']
})
export class PlateauComponent implements OnInit {
  cases: CasePlateau[] = [];
  lignes: CasePlateau[][] = [];
  casesAffichees: CasePlateau[] = [];
  listeCasesSequence: CasePlateau[] = [];

  pionIndex = 0;
  currentPionCase?: CasePlateau;
  pionOnBoard = false;
  pionColor: 'VERT' | 'JAUNE' | 'BLEU' | 'ROUGE' = 'VERT';

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

        // ✅ Restore pion state from localStorage
        this.restorePionFromStorage();
      },
      error: (err) => console.error('Erreur chargement plateau:', err)
    });
  }

  rollDice() {
    if (this.isRolling) return;
    this.isRolling = true;

    const value = Math.floor(Math.random() * 6) + 1;
    this.diceValue = value;

    setTimeout(() => {
      this.movePion(value);
      this.isRolling = false;

      // ✅ Save pion state after moving
      this.savePionToStorage();
    }, 1000);
  }

  movePion(steps: number) {
    if (!this.pionOnBoard) {
      if (steps === 6) {
        const startIndex = this.listeCasesSequence.findIndex(
          c => c.couleur === this.pionColor && c.position === 1
        );
        if (startIndex >= 0) {
          this.pionIndex = startIndex;
          this.currentPionCase = this.listeCasesSequence[this.pionIndex];
          this.pionOnBoard = true;

          // ✅ Save pion state when first placed on board
          this.savePionToStorage();
        }
      }
      return;
    }

    if (!this.currentPionCase) return;

    const currentPos = this.currentPionCase.position;
    const currentColor = this.currentPionCase.couleur;

    // Handle "échelle" logic
    if (currentColor === this.pionColor && currentPos >= 14 && currentPos <= 21) {
      const requiredRoll = currentPos === 14 ? 1 : (currentPos - 14);
      if (steps === requiredRoll) {
        const targetPos = currentPos === 14 ? 16 : currentPos + 1;
        const nextIndex = this.listeCasesSequence.findIndex(
          c => c.couleur === this.pionColor && c.position === targetPos
        );
        if (nextIndex >= 0) {
          this.pionIndex = nextIndex;
          this.currentPionCase = this.listeCasesSequence[this.pionIndex];

          // ✅ Save pion state after moving on the ladder
          this.savePionToStorage();
        }
      }
      return;
    }

    let newIndex = this.pionIndex;
    for (let i = 0; i < steps; i++) {
      let nextIndex = newIndex + 1;
      if (nextIndex >= this.listeCasesSequence.length) nextIndex = 0;

      const nextCase = this.listeCasesSequence[nextIndex];

      if (nextCase.couleur === this.pionColor && nextCase.position === 14) {
        newIndex = nextIndex;
        break;
      }

      newIndex = nextIndex;
    }

    this.pionIndex = newIndex;
    this.currentPionCase = this.listeCasesSequence[this.pionIndex];

    this.savePionToStorage();
  }

  private savePionToStorage() {
    const pionState = {
      color: this.pionColor,
      index: this.pionIndex,
      onBoard: this.pionOnBoard
    };
    localStorage.setItem('pionState', JSON.stringify(pionState));
  }

  private restorePionFromStorage() {
    const saved = localStorage.getItem('pionState');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.color === this.pionColor) {
        this.pionIndex = state.index;
        this.pionOnBoard = state.onBoard;
        this.currentPionCase = this.listeCasesSequence[this.pionIndex];
      }
    }
  }

  restartPion() {
    this.pionOnBoard = false;
    this.pionIndex = 0;
    this.currentPionCase = undefined;

    // Remove the saved state from localStorage
    this.savePionToStorage();
  }

  private genererListeSequence(cases: CasePlateau[]): CasePlateau[] {
    const seq: CasePlateau[] = [];
    const add = (color: string, positions: number[]) => {
      seq.push(
        ...cases
          .filter(c => c.couleur === color && positions.includes(c.position))
          .sort((a, b) => positions.indexOf(a.position) - positions.indexOf(b.position))
      );
    };

    add('VERT', Array.from({ length: 13 }, (_, i) => i + 1));
    add('JAUNE', [14]);
    add('JAUNE', Array.from({ length: 13 }, (_, i) => i + 1));
    add('BLEU', [14]);
    add('BLEU', Array.from({ length: 13 }, (_, i) => i + 1));
    add('ROUGE', [14]);
    add('ROUGE', Array.from({ length: 13 }, (_, i) => i + 1));
    add('VERT', [14]);

    const home = [16, 17, 18, 19, 20, 21];
    add('VERT', home);
    add('JAUNE', home);
    add('BLEU', home);
    add('ROUGE', home);

    return seq;
  }

  generateGrille(cases: CasePlateau[]): CasePlateau[][] {
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

    let jaunePosition = 12;
    let bleuPosition1 = 16;
    let bleuPosition2 = 2;
    for (let i = 1; i <= 5; i++) {
      lignes.push([
        ...Array(6).fill(find('JAUNE', 15)),
        find('JAUNE', jaunePosition),
        find('BLEU', bleuPosition1),
        find('BLEU', bleuPosition2),
        ...Array(6).fill(find('BLEU', 15))
      ]);
      jaunePosition--;
      bleuPosition1++;
      bleuPosition2++;
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
      find('ROUGE', 14),
    ]);

    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('VERT', 13 - i)),
      find('VERT', 21),
      ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7 - i))
    ]);

    let vertPosition1 = 6;
    let vertPosition2 = 20;
    let rougePosition = 8;
    for (let i = 1; i <= 5; i++) {
      lignes.push([
        ...Array(6).fill(find('VERT', 15)),
        find('VERT', vertPosition1),
        find('VERT', vertPosition2),
        find('ROUGE', rougePosition),
        ...Array(6).fill(find('ROUGE', 15))
      ]);
      vertPosition1--;
      vertPosition2--;
      rougePosition++;
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

  toggleRules() {
    this.showRules = !this.showRules;
  }
}
