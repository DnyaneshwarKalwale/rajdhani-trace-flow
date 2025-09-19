import { supabase, ProductRecipe, RecipeMaterial } from '@/lib/supabase';
import { generateUniqueId } from '@/lib/idGenerator';

export interface CreateRecipeData {
  product_id: string;
  product_name: string;
  materials: {
    material_id: string;
    material_name: string;
    quantity: number;
    unit: string;
    cost_per_unit: number;
  }[];
  created_by?: string;
}

export interface RecipeWithMaterials extends ProductRecipe {
  recipe_materials: RecipeMaterial[];
}

export class ProductRecipeService {
  // Create a new product recipe with materials
  static async createRecipe(recipeData: CreateRecipeData): Promise<{ data: RecipeWithMaterials | null; error: string | null }> {
    try {
      const recipeId = generateUniqueId('RECIPE');
      const totalCost = recipeData.materials.reduce((sum, material) => 
        sum + (material.cost_per_unit * material.quantity), 0
      );

      // Create the recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('product_recipes')
        .insert({
          id: recipeId,
          product_id: recipeData.product_id,
          product_name: recipeData.product_name, // Use product_name to match database schema
          total_cost: 0, // No total cost since quantities are dynamic
          created_by: recipeData.created_by || 'admin'
        })
        .select()
        .single();

      if (recipeError) {
        console.error('Error creating recipe:', recipeError);
        return { data: null, error: recipeError.message };
      }

      // Create recipe materials with required fields
      console.log('🔍 Creating recipe materials for recipe_id:', recipeId);
      console.log('🔍 Recipe materials data:', recipeData.materials);
      
      const recipeMaterials = recipeData.materials.map((material, index) => {
        console.log(`🔍 Processing material ${index}:`, material);
        
        const recipeMaterial = {
          id: generateUniqueId('RECMAT'),
          recipe_id: recipeId,
          material_id: material.material_id,
          material_name: material.material_name,
          quantity: 1, // Default quantity for recipe reference
          unit: material.unit,
          cost_per_unit: material.cost_per_unit,
          total_cost: material.cost_per_unit * 1 // Default total cost
        };
        
        console.log(`🔍 Created recipe material ${index}:`, recipeMaterial);
        return recipeMaterial;
      });
      
      console.log('🔍 All recipe materials to insert:', recipeMaterials);

      console.log('🔍 Inserting recipe materials into database...');
      const { data: insertedMaterials, error: materialsError } = await supabase
        .from('recipe_materials')
        .insert(recipeMaterials)
        .select();

      if (materialsError) {
        console.error('❌ Error creating recipe materials:', materialsError);
        console.error('❌ Failed recipe materials data:', recipeMaterials);
        // Clean up the recipe if materials failed
        await supabase.from('product_recipes').delete().eq('id', recipeId);
        return { data: null, error: materialsError.message };
      }

      console.log('✅ Recipe materials inserted successfully:', insertedMaterials);

      // Fetch the complete recipe with materials
      const { data: completeRecipe, error: fetchError } = await supabase
        .from('product_recipes')
        .select(`
          *,
          recipe_materials (*)
        `)
        .eq('id', recipeId)
        .single();

      if (fetchError) {
        console.error('Error fetching complete recipe:', fetchError);
        return { data: null, error: fetchError.message };
      }

      return { data: completeRecipe, error: null };
    } catch (error) {
      console.error('Error in createRecipe:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update an existing recipe
  static async updateRecipe(recipeId: string, recipeData: Partial<CreateRecipeData>): Promise<{ data: RecipeWithMaterials | null; error: string | null }> {
    try {
      // If materials are being updated, recalculate total cost
      let totalCost = 0;
      if (recipeData.materials) {
        totalCost = recipeData.materials.reduce((sum, material) => 
          sum + (material.cost_per_unit * material.quantity), 0
        );
      }

      // Update the recipe
      const updateData: any = {};
      if (recipeData.product_name) updateData.product_name = recipeData.product_name;
      // No total cost since quantities are dynamic

      if (Object.keys(updateData).length > 0) {
        const { error: recipeError } = await supabase
          .from('product_recipes')
          .update(updateData)
          .eq('id', recipeId);

        if (recipeError) {
          console.error('Error updating recipe:', recipeError);
          return { data: null, error: recipeError.message };
        }
      }

      // Update recipe materials if provided
      if (recipeData.materials) {
        // Delete existing materials
        const { error: deleteError } = await supabase
          .from('recipe_materials')
          .delete()
          .eq('recipe_id', recipeId);

        if (deleteError) {
          console.error('Error deleting old recipe materials:', deleteError);
          return { data: null, error: deleteError.message };
        }

        // Insert new materials
        const recipeMaterials = recipeData.materials.map(material => ({
          id: generateUniqueId('RECMAT'),
          recipe_id: recipeId,
          material_id: material.material_id,
          material_name: material.material_name,
          // No quantity field since quantities are dynamic
          unit: material.unit,
          cost_per_unit: material.cost_per_unit,
          // No total_cost since quantities are dynamic
        }));

        const { error: materialsError } = await supabase
          .from('recipe_materials')
          .insert(recipeMaterials);

        if (materialsError) {
          console.error('Error creating new recipe materials:', materialsError);
          return { data: null, error: materialsError.message };
        }
      }

      // Fetch the updated recipe with materials
      const { data: completeRecipe, error: fetchError } = await supabase
        .from('product_recipes')
        .select(`
          *,
          recipe_materials (*)
        `)
        .eq('id', recipeId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated recipe:', fetchError);
        return { data: null, error: fetchError.message };
      }

      return { data: completeRecipe, error: null };
    } catch (error) {
      console.error('Error in updateRecipe:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get recipe by product ID
  static async getRecipeByProductId(productId: string): Promise<{ data: RecipeWithMaterials | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('product_recipes')
        .select(`
          *,
          recipe_materials (*)
        `)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching recipe:', error);
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error in getRecipeByProductId:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get recipe by recipe ID
  static async getRecipeById(recipeId: string): Promise<{ data: RecipeWithMaterials | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('product_recipes')
        .select(`
          *,
          recipe_materials (*)
        `)
        .eq('id', recipeId)
        .single();

      if (error) {
        console.error('Error fetching recipe:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getRecipeById:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a recipe
  static async deleteRecipe(recipeId: string): Promise<{ error: string | null }> {
    try {
      // Delete recipe materials first (due to foreign key constraint)
      const { error: materialsError } = await supabase
        .from('recipe_materials')
        .delete()
        .eq('recipe_id', recipeId);

      if (materialsError) {
        console.error('Error deleting recipe materials:', materialsError);
        return { error: materialsError.message };
      }

      // Delete the recipe
      const { error: recipeError } = await supabase
        .from('product_recipes')
        .delete()
        .eq('id', recipeId);

      if (recipeError) {
        console.error('Error deleting recipe:', recipeError);
        return { error: recipeError.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteRecipe:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get all recipes
  static async getAllRecipes(): Promise<{ data: RecipeWithMaterials[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('product_recipes')
        .select(`
          *,
          recipe_materials (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recipes:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getAllRecipes:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create or update recipe from production material usage
  static async createOrUpdateRecipeFromProduction(
    productId: string,
    productName: string,
    materialsUsed: {
      material_id: string;
      material_name: string;
      quantity: number;
      unit: string;
      cost_per_unit: number;
    }[],
    createdBy: string = 'production'
  ): Promise<{ data: RecipeWithMaterials | null; error: string | null }> {
    try {
      // Check if recipe already exists for this product
      const { data: existingRecipe, error: fetchError } = await this.getRecipeByProductId(productId);

      if (fetchError && fetchError !== 'No recipe found') {
        return { data: null, error: fetchError };
      }

      if (existingRecipe) {
        // Update existing recipe with new material usage
        console.log(`🔄 Updating existing recipe for ${productName} with production data`);
        return await this.updateRecipe(existingRecipe.id, {
          materials: materialsUsed.map(m => ({
            material_id: m.material_id,
            material_name: m.material_name,
            quantity: m.quantity,
            unit: m.unit,
            cost_per_unit: m.cost_per_unit
          }))
        });
      } else {
        // Create new recipe from production data
        console.log(`✨ Creating new recipe for ${productName} from production data`);
        return await this.createRecipe({
          product_id: productId,
          product_name: productName,
          materials: materialsUsed.map(m => ({
            material_id: m.material_id,
            material_name: m.material_name,
            quantity: m.quantity,
            unit: m.unit,
            cost_per_unit: m.cost_per_unit
          })),
          created_by: createdBy
        });
      }
    } catch (error) {
      console.error('Error in createOrUpdateRecipeFromProduction:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Smart recipe creation - checks if recipe exists and asks user for action
  static async smartCreateRecipe(
    productId: string,
    productName: string,
    materialsUsed: {
      material_id: string;
      material_name: string;
      quantity: number;
      unit: string;
      cost_per_unit: number;
    }[],
    options: {
      forceCreate?: boolean; // Force create new recipe even if one exists
      updateExisting?: boolean; // Update existing recipe if found
      askUser?: boolean; // Ask user what to do if recipe exists
      createdBy?: string;
    } = {}
  ): Promise<{ data: RecipeWithMaterials | null; error: string | null; action?: 'created' | 'updated' | 'skipped' }> {
    try {
      const { forceCreate = false, updateExisting = true, askUser = false, createdBy = 'user' } = options;

      // Check if recipe exists
      const { data: existingRecipe } = await this.getRecipeByProductId(productId);

      if (existingRecipe) {
        if (forceCreate) {
          // Create a new recipe anyway (could be a variant)
          const result = await this.createRecipe({
            product_id: productId,
            product_name: `${productName} (Variant)`,
            materials: materialsUsed.map(m => ({
              material_id: m.material_id,
              material_name: m.material_name,
              quantity: m.quantity,
              unit: m.unit,
              cost_per_unit: m.cost_per_unit
            })),
            created_by: createdBy
          });
          return { ...result, action: 'created' };
        } else if (updateExisting) {
          // Update existing recipe
          const result = await this.updateRecipe(existingRecipe.id, {
            materials: materialsUsed.map(m => ({
              material_id: m.material_id,
              material_name: m.material_name,
              quantity: m.quantity,
              unit: m.unit,
              cost_per_unit: m.cost_per_unit
            }))
          });
          return { ...result, action: 'updated' };
        } else {
          // Skip - recipe exists and user doesn't want to update
          return { data: existingRecipe, error: null, action: 'skipped' };
        }
      } else {
        // No existing recipe, create new one
        const result = await this.createRecipe({
          product_id: productId,
          product_name: productName,
          materials: materialsUsed.map(m => ({
            material_id: m.material_id,
            material_name: m.material_name,
            quantity: m.quantity,
            unit: m.unit,
            cost_per_unit: m.cost_per_unit
          })),
          created_by: createdBy
        });
        return { ...result, action: 'created' };
      }
    } catch (error) {
      console.error('Error in smartCreateRecipe:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
