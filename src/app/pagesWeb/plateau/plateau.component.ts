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
  listeCasesSequence: CasePlateau[] = [];  // 👈 new
  showRules = false;

  constructor(private caseService: CasePlateauService) {}

  // Dé
  diceValue: number | null = null;
  isRolling = false;

  ngOnInit(): void {
    this.caseService.getAll().subscribe({
      next: (data) => {
        this.cases = data;
        this.lignes = this.generateGrille(data);
        this.casesAffichees = this.lignes.flat();

        // 👇 build the sequence list once data is available
        this.listeCasesSequence = this.genererListeSequence(data);
      },
      error: (err) => console.error('Erreur chargement plateau:', err)
    });
  }

  // Dé
  rollDice() {
    if (this.isRolling) return;
    this.isRolling = true;
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
      rollCount++;
      if (rollCount > 15) {  // rolling animation duration
        clearInterval(rollInterval);
        this.isRolling = false;
      }
    }, 80);
  }

  //Parcours du plateau, début arbitraire au départ vert
  private genererListeSequence(cases: CasePlateau[]): CasePlateau[] {
    const result: CasePlateau[] = [];

    const get = (couleur: string, pos: number) =>
      cases.find(c => c.couleur === couleur && c.position === pos)!;

    // VERT 1–13
    for (let i = 1; i <= 13; i++) result.push(get('VERT', i));

    // JAUNE 14 + 1–13
    result.push(get('JAUNE', 14));
    for (let i = 1; i <= 13; i++) result.push(get('JAUNE', i));

    // BLEU 14 + 1–13
    result.push(get('BLEU', 14));
    for (let i = 1; i <= 13; i++) result.push(get('BLEU', i));

    // ROUGE 14 + 1–13
    result.push(get('ROUGE', 14));
    for (let i = 1; i <= 13; i++) result.push(get('ROUGE', i));

    // VERT 14
    result.push(get('VERT', 14));

    return result;
  }

  generateGrille(cases: CasePlateau[]): CasePlateau[][] {
    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

    // ligne 1
    lignes.push([
      ...Array(6).fill(find('JAUNE', 15)),
      find('JAUNE', 13),
      find('BLEU', 14),
      find('BLEU', 1),
      ...Array(6).fill(find('BLEU', 15))
    ]);

    // ligne 2 à 6
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

    // ligne 7
    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('JAUNE', i + 1)),
      find('BLEU', 21),
      ...Array.from({ length: 7 }, (_, i) => find('BLEU', i + 7))
    ]);

    // ligne 8
    lignes.push([
      find('JAUNE', 14),
      ...Array.from({ length: 6 }, (_, i) => find('JAUNE', i + 16)),
      find('BLEU', 85),
      ...Array.from({ length: 6 }, (_, i) => find('ROUGE', 21 - i)),
      find('ROUGE', 14),
    ]);

    // ligne 9
    lignes.push([
      ...Array.from({ length: 7 }, (_, i) => find('VERT', 13 - i)),
      find('VERT', 21),
      ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7 - i))
    ]);

    // ligne 10 à 14
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

    // ligne 15
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
