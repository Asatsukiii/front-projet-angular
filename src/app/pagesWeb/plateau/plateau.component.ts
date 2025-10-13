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

        this.pionIndex = this.findPionStartIndex();
        this.pionOnBoard = false;
        this.currentPionCase = undefined; // will display under board
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
    }, 1000);
  }

  movePion(steps: number) {
    // If pawn is not on board yet
    if (!this.pionOnBoard) {
      if (steps === 6) {
        // Move to start of track (position 1)
        const startIndex = this.listeCasesSequence.findIndex(
          c => c.couleur === this.pionColor && c.position === 1
        );
        if (startIndex >= 0) {
          this.pionIndex = startIndex;
          this.currentPionCase = this.listeCasesSequence[this.pionIndex];
          this.pionOnBoard = true; // now pawn is on the board
        }
      }
      return; // otherwise, stay in stable display
    }

    // Normal movement for pawn already on board
    if (!this.currentPionCase) return;

    if (this.currentPionCase.position === 14 && this.currentPionCase.couleur === this.pionColor) return;

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
  }

  private findPionStartIndex(): number {
    return this.listeCasesSequence.findIndex(
      c => c.couleur === this.pionColor && c.position === 1
    );
  }

  private genererListeSequence(cases: CasePlateau[]): CasePlateau[] {
    const result: CasePlateau[] = [];
    const get = (couleur: string, pos: number) =>
      cases.find(c => c.couleur === couleur && c.position === pos)!;

    for (let i = 1; i <= 13; i++) result.push(get('VERT', i));
    result.push(get('JAUNE', 14));
    for (let i = 1; i <= 13; i++) result.push(get('JAUNE', i));
    result.push(get('BLEU', 14));
    for (let i = 1; i <= 13; i++) result.push(get('BLEU', i));
    result.push(get('ROUGE', 14));
    for (let i = 1; i <= 13; i++) result.push(get('ROUGE', i));
    result.push(get('VERT', 14));
    return result;
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
      find('BLEU', 85),
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
