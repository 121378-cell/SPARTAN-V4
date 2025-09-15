
"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Input, Label, Badge, Alert, AlertTitle, AlertDescription } from "./ui";
import { Check, Clock, ShoppingCart, Utensils, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import type { MacroGoals, Recipe, ShoppingListItem } from "../lib/types";
import { generateRecipesApi } from "../lib/api";


interface RecipeGeneratorProps {
    onBack: () => void;
}

export default function RecipeGenerator({ onBack }: RecipeGeneratorProps) {
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  });
  
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'shopping'>('recipes');
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const generateRecipes = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedRecipes([]);

    try {
        const recipesFromApi = await generateRecipesApi({
            macroGoals,
            dietaryPreferences,
            allergies,
        });

        if (isMounted.current) {
            const newRecipes = recipesFromApi.map(recipe => ({
                ...recipe,
                id: Math.random().toString(36).substring(2, 9),
            }));

            setGeneratedRecipes(newRecipes);
            generateShoppingList(newRecipes);
        }
    } catch (e) {
        console.error("Failed to generate recipes:", e);
        if (isMounted.current) {
            setError("Lo sentimos, no pudimos generar recetas en este momento. Por favor, inténtalo de nuevo.");
        }
    } finally {
        if (isMounted.current) {
            setIsGenerating(false);
        }
    }
  };

  const generateShoppingList = (recipes: Recipe[]) => {
    const listMap: Map<string, ShoppingListItem> = new Map();
    
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name}-${ing.category}`;
        if (listMap.has(key)) {
            const existing = listMap.get(key)!;
            const currentAmount = parseFloat(existing.amount) || 0;
            const newAmount = parseFloat(ing.amount) || 0;
            const unit = existing.amount.replace(/[0-9.]/g, '');
            existing.amount = `${currentAmount + newAmount}${unit}`;
        } else {
            listMap.set(key, {
                ingredient: ing.name,
                amount: ing.amount,
                category: ing.category,
                purchased: false
            });
        }
      });
    });
    
    setShoppingList(Array.from(listMap.values()));
  };

  const togglePurchased = (index: number) => {
    const updatedList = [...shoppingList];
    updatedList[index].purchased = !updatedList[index].purchased;
    setShoppingList(updatedList);
  };
  
  const toggleRecipeInstructions = (recipeId: string) => {
    setExpandedRecipes(prev => ({...prev, [recipeId]: !prev[recipeId]}));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Generador de Recetas Inteligente</h1>
            <Button variant="outline" size="default" onClick={onBack}>
                Volver al Dashboard
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Panel de configuración */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Macros</CardTitle>
                <CardDescription>
                  Ajusta tus metas nutricionales diarias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calorías (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={macroGoals.calories}
                    onChange={(e) => setMacroGoals({...macroGoals, calories: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Proteína (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={macroGoals.protein}
                    onChange={(e) => setMacroGoals({...macroGoals, protein: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohidratos (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={macroGoals.carbs}
                    onChange={(e) => setMacroGoals({...macroGoals, carbs: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats">Grasas (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    value={macroGoals.fats}
                    onChange={(e) => setMacroGoals({...macroGoals, fats: parseInt(e.target.value) || 0})}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dieta</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetariano', 'Vegano', 'Keto', 'Sin gluten'].map(pref => (
                      <Button
                        key={pref}
                        variant={dietaryPreferences.includes(pref) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (dietaryPreferences.includes(pref)) {
                            setDietaryPreferences(dietaryPreferences.filter(p => p !== pref));
                          } else {
                            setDietaryPreferences([...dietaryPreferences, pref]);
                          }
                        }}
                      >
                        {pref}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Alergias</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Lácteos', 'Huevo', 'Frutos secos', 'Mariscos', 'Soja'].map(allergy => (
                      <Button
                        key={allergy}
                        variant={allergies.includes(allergy) ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (allergies.includes(allergy)) {
                            setAllergies(allergies.filter(a => a !== allergy));
                          } else {
                            setAllergies([...allergies, allergy]);
                          }
                        }}
                      >
                        {allergy}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={generateRecipes}
              disabled={isGenerating}
              className="w-full"
              size="lg"
              variant="default"
            >
              {isGenerating ? 'Generando...' : 'Generar Recetas'}
            </Button>
          </div>
          
          {/* Contenido principal */}
          <div className="md:col-span-3 space-y-6">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </div>
                </Alert>
            )}
            <div className="flex border-b">
              <Button
                variant={activeTab === 'recipes' ? 'secondary' : 'ghost'}
                size="default"
                onClick={() => setActiveTab('recipes')}
              >
                <Utensils className="h-4 w-4 mr-2" />
                Recetas
              </Button>
              <Button
                variant={activeTab === 'shopping' ? 'secondary' : 'ghost'}
                size="default"
                onClick={() => setActiveTab('shopping')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Lista de Compras
              </Button>
            </div>
            
            {activeTab === 'recipes' ? (
              <div className="space-y-6">
                {isGenerating && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p>Generando recetas personalizadas según tus macros...</p>
                    </CardContent>
                  </Card>
                )}
                
                {!isGenerating && generatedRecipes.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p>Configura tus macros y preferencias, luego haz clic en "Generar Recetas"</p>
                    </CardContent>
                  </Card>
                )}
                
                {generatedRecipes.map(recipe => (
                  <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{recipe.name}</CardTitle>
                          <CardDescription>{recipe.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prepTime + recipe.cookTime} min
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Ingredientes</h3>
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>
                                  {ingredient.amount} {ingredient.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {Math.round(ingredient.macros.protein)}P / {Math.round(ingredient.macros.carbs)}C / {Math.round(ingredient.macros.fats)}G
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-semibold">Instrucciones</h3>
                            <ol className="space-y-2 list-decimal pl-5">
                                {(expandedRecipes[recipe.id] ? recipe.instructions : recipe.instructions.slice(0, 2)).map((step, idx) => (
                                    <li key={idx} className="pb-2 text-sm">{step}</li>
                                ))}
                            </ol>
                            {recipe.instructions.length > 2 && (
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRecipeInstructions(recipe.id)}
                                className="text-sm"
                                >
                                {expandedRecipes[recipe.id] ? (
                                    <><ChevronUp className="h-4 w-4 mr-1" />Mostrar menos</>
                                ) : (
                                    <><ChevronDown className="h-4 w-4 mr-1" />Mostrar todas ({recipe.instructions.length} pasos)</>
                                )}
                                </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t pt-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Calorías</p>
                          <p className="font-bold">{Math.round(recipe.totalMacros.calories)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Proteína</p>
                          <p className="font-bold">{Math.round(recipe.totalMacros.protein)}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Carbos</p>
                          <p className="font-bold">{Math.round(recipe.totalMacros.carbs)}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Grasas</p>
                          <p className="font-bold">{Math.round(recipe.totalMacros.fats)}g</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {recipe.mealType}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Lista de Compras</h2>
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
                
                {shoppingList.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p>Genera recetas para ver tu lista de compras automática</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {['proteína', 'carbohidrato', 'vegetal', 'grasa', 'líquido', 'fruta', 'otros'].map(category => {
                      const categoryItems = shoppingList.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <Card key={category}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg capitalize">{category}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {categoryItems.map((item, idx) => (
                                <li 
                                  key={idx} 
                                  className={`flex items-center justify-between cursor-pointer ${item.purchased ? 'opacity-60' : ''}`}
                                  onClick={() => togglePurchased(shoppingList.findIndex(i => i.ingredient === item.ingredient))}
                                >
                                  <div className="flex items-center">
                                    <div className="mr-2">
                                      {item.purchased ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <div className="h-4 w-4 border rounded" />
                                      )}
                                    </div>
                                    <span className={item.purchased ? 'line-through' : ''}>
                                      {item.ingredient}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {item.amount}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
