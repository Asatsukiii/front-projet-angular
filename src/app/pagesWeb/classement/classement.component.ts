import { Component, OnInit } from '@angular/core';
import { StatistiquesJoueurService } from '../../services/statistiques-joueur.service';
import { StatistiquesJoueur } from '../../models/statistiques.model';

// Page de gestion de l'affichage du classement.
// Celui-ci trie d'abord par nombre de parties gagnées puis affine parle pourcentage de réussite

interface JoueurClassement {
  position: number;
  pseudo: string;
  partiesJouees: number;
  partiesGagnees: number;
  tauxVictoire: number;
}

@Component({
  selector: 'classement',
  templateUrl: './classement.component.html',
  styleUrls: ['./classement.component.scss']
})
export class ClassementComponent implements OnInit {

  joueurs: JoueurClassement[] = [];
  loading = true;
  error: string | null = null;

  constructor(private statistiquesService: StatistiquesJoueurService) {}

  ngOnInit(): void {
    this.statistiquesService.getAll().subscribe({
      next: (stats: StatistiquesJoueur[]) => {
        this.joueurs = stats
          .map(stat => ({
            pseudo: stat.joueur?.pseudo ?? 'Inconnu',
            partiesJouees: stat.partiesJouees,
            partiesGagnees: stat.partiesGagnees,
            tauxVictoire: stat.partiesJouees > 0
              ? (stat.partiesGagnees / stat.partiesJouees) * 100
              : 0
          }))
          .sort((a, b) =>{
            if (b.partiesGagnees !== a.partiesGagnees) {
              return b.partiesGagnees - a.partiesGagnees;
            }
            return b.tauxVictoire - a.tauxVictoire;
          })
          .map((joueur, index) => ({
            ...joueur,
            position: index + 1
          }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du classement:', err);
        this.error = 'Impossible de charger le classement.';
        this.loading = false;
      }
    });
  }
}
