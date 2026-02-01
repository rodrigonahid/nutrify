"use client";

import { Control, useFieldArray, UseFormRegister, FieldErrors, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { z } from "zod";
import { mealPlanFormSchema } from "@/lib/validation";

type MealPlanFormData = z.infer<typeof mealPlanFormSchema>;

interface MealFieldArrayProps {
  mealIndex: number;
  control: Control<MealPlanFormData>;
  register: UseFormRegister<MealPlanFormData>;
  errors: FieldErrors<MealPlanFormData>;
  onRemove: () => void;
}

export function MealFieldArray({
  mealIndex,
  control,
  register,
  errors,
  onRemove,
}: MealFieldArrayProps) {
  const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `meals.${mealIndex}.options` as const,
  });

  function addOption() {
    appendOption({
      name: "",
      notes: "",
      ingredients: [],
    });
  }

  const mealErrors = errors.meals?.[mealIndex];

  return (
    <div className="space-y-4">
      {/* Meal Time */}
      <div>
        <Label htmlFor={`meal-time-${mealIndex}`}>Time</Label>
        <Input
          id={`meal-time-${mealIndex}`}
          type="time"
          {...register(`meals.${mealIndex}.timeOfDay`)}
        />
        {mealErrors?.timeOfDay && (
          <p className="text-xs text-destructive mt-1">
            {mealErrors.timeOfDay.message}
          </p>
        )}
      </div>

      {/* Hidden orderIndex field */}
      <input
        type="hidden"
        {...register(`meals.${mealIndex}.orderIndex`, {
          valueAsNumber: true,
        })}
        value={mealIndex}
      />

      {/* Options */}
      {options.map((option, optIdx) => (
        <OptionFieldArray
          key={option.id}
          mealIndex={mealIndex}
          optionIndex={optIdx}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => removeOption(optIdx)}
        />
      ))}

      <Button type="button" variant="outline" onClick={addOption}>
        + Add Option
      </Button>

      {mealErrors?.options && typeof mealErrors.options.message === "string" && (
        <p className="text-xs text-destructive">{mealErrors.options.message}</p>
      )}
    </div>
  );
}

interface OptionFieldArrayProps {
  mealIndex: number;
  optionIndex: number;
  control: Control<MealPlanFormData>;
  register: UseFormRegister<MealPlanFormData>;
  errors: FieldErrors<MealPlanFormData>;
  onRemove: () => void;
}

function OptionFieldArray({
  mealIndex,
  optionIndex,
  control,
  register,
  errors,
  onRemove,
}: OptionFieldArrayProps) {
  const { fields: ingredients, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: `meals.${mealIndex}.options.${optionIndex}.ingredients` as const,
  });

  function addIngredient() {
    appendIngredient({
      ingredientName: "",
      quantity: 0,
      unit: "g",
      orderIndex: ingredients.length,
    });
  }

  const optionErrors = errors.meals?.[mealIndex]?.options?.[optionIndex];

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Option {optionIndex + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 h-8"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`option-name-${mealIndex}-${optionIndex}`}>
            Option Name
          </Label>
          <Input
            id={`option-name-${mealIndex}-${optionIndex}`}
            {...register(`meals.${mealIndex}.options.${optionIndex}.name`)}
            placeholder="e.g., Grilled Chicken"
          />
          {optionErrors?.name && (
            <p className="text-xs text-destructive mt-1">
              {optionErrors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor={`option-notes-${mealIndex}-${optionIndex}`}>
            Notes (optional)
          </Label>
          <Input
            id={`option-notes-${mealIndex}-${optionIndex}`}
            {...register(`meals.${mealIndex}.options.${optionIndex}.notes`)}
            placeholder="Preparation notes"
          />
          {optionErrors?.notes && (
            <p className="text-xs text-destructive mt-1">
              {optionErrors.notes.message}
            </p>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="ml-4 space-y-2">
        <Label className="text-sm font-medium">Ingredients</Label>
        {ingredients.map((ingredient, ingIdx) => (
          <div key={ingredient.id} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                {...register(
                  `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.ingredientName`
                )}
                placeholder="Ingredient name"
                className="h-9"
              />
              {optionErrors?.ingredients?.[ingIdx]?.ingredientName && (
                <p className="text-xs text-destructive mt-0.5">
                  {optionErrors.ingredients[ingIdx]?.ingredientName?.message}
                </p>
              )}
            </div>

            {/* Grouped Quantity + Unit Input */}
            <div className="inline-flex">
              <Input
                type="number"
                step="any"
                min="0"
                {...register(
                  `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.quantity`,
                  { valueAsNumber: true }
                )}
                placeholder="Qty"
                className="h-9 w-20 rounded-r-none border-r-0 focus-visible:z-10"
              />
              <Controller
                control={control}
                name={`meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.unit`}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 w-20 rounded-l-none border-l focus:z-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="cups">cups</SelectItem>
                      <SelectItem value="spoons">spoons</SelectItem>
                      <SelectItem value="scoops">scoops</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {optionErrors?.ingredients?.[ingIdx]?.quantity && (
              <p className="text-xs text-destructive mt-0.5 absolute">
                {optionErrors.ingredients[ingIdx]?.quantity?.message}
              </p>
            )}

            {/* Hidden orderIndex field */}
            <input
              type="hidden"
              {...register(
                `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.orderIndex`,
                { valueAsNumber: true }
              )}
              value={ingIdx}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeIngredient(ingIdx)}
              className="text-red-600 h-9 w-9 shrink-0"
              title="Remove ingredient"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
        >
          + Add Ingredient
        </Button>
        {optionErrors?.ingredients && typeof optionErrors.ingredients.message === "string" && (
          <p className="text-xs text-destructive">{optionErrors.ingredients.message}</p>
        )}
      </div>
    </div>
  );
}
