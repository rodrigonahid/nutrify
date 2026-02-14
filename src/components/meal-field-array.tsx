"use client";

import {
  Control,
  useFieldArray,
  UseFormRegister,
  FieldErrors,
  Controller,
} from "react-hook-form";
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
}: MealFieldArrayProps) {
  const {
    fields: options,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `meals.${mealIndex}.options` as const,
  });

  function addOption() {
    appendOption({ name: "", notes: "", ingredients: [] });
  }

  const mealErrors = errors.meals?.[mealIndex];

  return (
    <div className="space-y-3">

      {/* Time */}
      <div className="w-40">
        <Label
          htmlFor={`meal-time-${mealIndex}`}
          className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
        >
          Time
        </Label>
        <Input
          id={`meal-time-${mealIndex}`}
          type="time"
          {...register(`meals.${mealIndex}.timeOfDay`)}
        />
        {mealErrors?.timeOfDay && (
          <p className="text-[12px] font-medium text-[#DC2626] mt-1">
            {mealErrors.timeOfDay.message}
          </p>
        )}
      </div>

      <input
        type="hidden"
        {...register(`meals.${mealIndex}.orderIndex`, { valueAsNumber: true })}
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

      {mealErrors?.options && typeof mealErrors.options.message === "string" && (
        <p className="text-[12px] font-medium text-[#DC2626]">
          {mealErrors.options.message}
        </p>
      )}

      <button
        type="button"
        onClick={addOption}
        className="w-full h-9 flex items-center justify-center gap-1 text-[13px] font-semibold text-[#6B7280] border border-dashed border-[#D1D5DB] rounded-[8px] hover:border-[#2E8B5A] hover:text-[#2E8B5A] transition-colors duration-150"
      >
        + Add Option
      </button>
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
  const {
    fields: ingredients,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
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
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl overflow-hidden">

      {/* Option header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E5E7EB]">
        <p className="text-[13px] font-semibold text-[#374151]">
          Option {optionIndex + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="h-6 w-6 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded transition-colors duration-100"
          aria-label="Remove option"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Name + Notes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor={`option-name-${mealIndex}-${optionIndex}`}
              className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
            >
              Name
            </Label>
            <Input
              id={`option-name-${mealIndex}-${optionIndex}`}
              {...register(`meals.${mealIndex}.options.${optionIndex}.name`)}
              placeholder="e.g., Grilled Chicken"
            />
            {optionErrors?.name && (
              <p className="text-[12px] font-medium text-[#DC2626] mt-1">
                {optionErrors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor={`option-notes-${mealIndex}-${optionIndex}`}
              className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
            >
              Notes
              <span className="text-[#9CA3AF] font-normal ml-1">(optional)</span>
            </Label>
            <Input
              id={`option-notes-${mealIndex}-${optionIndex}`}
              {...register(`meals.${mealIndex}.options.${optionIndex}.notes`)}
              placeholder="Preparation notes"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Ingredients
          </p>

          {ingredients.map((ingredient, ingIdx) => (
            <div key={ingredient.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  {...register(
                    `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.ingredientName`
                  )}
                  placeholder="Ingredient"
                  className="h-9"
                />
                {optionErrors?.ingredients?.[ingIdx]?.ingredientName && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">
                    {optionErrors.ingredients[ingIdx]?.ingredientName?.message}
                  </p>
                )}
              </div>

              {/* Qty + Unit grouped */}
              <div className="inline-flex shrink-0">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  {...register(
                    `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.quantity`,
                    { valueAsNumber: true }
                  )}
                  placeholder="Qty"
                  className="h-9 w-[68px] rounded-r-none border-r-0 focus-visible:z-10"
                />
                <Controller
                  control={control}
                  name={`meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.unit`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 w-[72px] rounded-l-none border-l">
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

              <input
                type="hidden"
                {...register(
                  `meals.${mealIndex}.options.${optionIndex}.ingredients.${ingIdx}.orderIndex`,
                  { valueAsNumber: true }
                )}
                value={ingIdx}
              />

              <button
                type="button"
                onClick={() => removeIngredient(ingIdx)}
                className="h-9 w-9 flex items-center justify-center shrink-0 text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                aria-label="Remove ingredient"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ))}

          {optionErrors?.ingredients &&
            typeof optionErrors.ingredients.message === "string" && (
              <p className="text-[12px] font-medium text-[#DC2626]">
                {optionErrors.ingredients.message}
              </p>
            )}

          <button
            type="button"
            onClick={addIngredient}
            className="h-8 px-3 text-[12px] font-semibold text-[#6B7280] border border-dashed border-[#D1D5DB] rounded-[6px] hover:border-[#2E8B5A] hover:text-[#2E8B5A] transition-colors duration-150"
          >
            + Add Ingredient
          </button>
        </div>
      </div>
    </div>
  );
}
