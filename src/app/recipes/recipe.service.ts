import { EventEmitter, Injectable } from '@angular/core';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RecipeService {
  //recipeSelected = new EventEmitter<Recipe>();
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];
  // private recipes: Recipe[] = [
  //   new Recipe ('A Healthy Recipe',
  //   'This is Healthy',
  //   'https://images.unsplash.com/photo-1466637574441-749b8f19452f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80.jpg',
  //   [
  //     new Ingredient('Potato',3),
  //     new Ingredient('Onion',4)
  //   ]),
  //   new Recipe ('A Noodles Recipe',
  //   'This is Delicious',
  //   'https://p0.piqsels.com/preview/326/176/915/food-pasta-plate-plating.jpg',
  //   [
  //     new Ingredient('Noodles',50),
  //     new Ingredient('Lemon',3)
  //   ])        
  // ];

  constructor(private slService: ShoppingListService) {}

  setRecipes(recipes : Recipe[]){
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice())
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number){
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  addRecipe(recipe : Recipe){
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(id :number , newRecipe : Recipe){
    this.recipes[id] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(id: number){
    this.recipes.splice(id , 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
