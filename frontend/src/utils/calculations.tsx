import { Criterion, Alternative, SAWResult, WPResult } from "@/lib/api";

export const calculateSAW = (
  criteria: Criterion[],
  alternatives: Alternative[]
): SAWResult[] => {
  // Step 1: Create decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.values[crit.id] || 0)
  );

  // Step 2: Normalize decision matrix
  const normalizedMatrix: number[][] = matrix.map((row, i) =>
    row.map((value, j) => {
      const criterion = criteria[j];
      const columnValues = matrix.map((r) => r[j]);

      if (criterion.type === "benefit") {
        const maxValue = Math.max(...columnValues);
        return maxValue > 0 ? value / maxValue : 0;
      } else {
        const minValue = Math.min(...columnValues.filter((v) => v > 0));
        return minValue > 0 && value > 0 ? minValue / value : 0;
      }
    })
  );

  // Step 3: Calculate preference values
  const preferenceValues = normalizedMatrix.map((row) =>
    row.reduce(
      (sum, normalizedValue, j) => sum + normalizedValue * criteria[j].weight,
      0
    )
  );

  // Step 4: Create results with ranking
  const results: SAWResult[] = alternatives.map((alt, i) => ({
    alternativeId: alt.id,
    score: preferenceValues[i],
    rank: 0, // Will be set after sorting
  }));

  // Sort by score descending and assign ranks
  results.sort((a, b) => b.score - a.score);
  results.forEach((result, i) => {
    result.rank = i + 1;
  });

  return results;
};

export const calculateWP = (
  criteria: Criterion[],
  alternatives: Alternative[]
): WPResult[] => {
  // Step 1: Normalize weights
  const totalWeight = criteria.reduce((sum, crit) => sum + crit.weight, 0);
  const normalizedWeights = criteria.map((crit) => crit.weight / totalWeight);

  // Step 2: Adjust weights for cost criteria (negative for WP method)
  const adjustedWeights = criteria.map((crit, i) =>
    crit.type === "cost" ? -normalizedWeights[i] : normalizedWeights[i]
  );

  // Step 3: Calculate S values (vector S)
  const sValues = alternatives.map((alt) => {
    let s = 1;
    criteria.forEach((crit, i) => {
      const value = alt.values[crit.id] || 0;
      if (value > 0) {
        s *= Math.pow(value, adjustedWeights[i]);
      }
    });
    return s;
  });

  // Step 4: Calculate V values (preference values)
  const totalS = sValues.reduce((sum, s) => sum + s, 0);
  const vValues = sValues.map((s) => (totalS > 0 ? s / totalS : 0));

  // Step 5: Create results with ranking
  const results: WPResult[] = alternatives.map((alt, i) => ({
    alternativeId: alt.id,
    score: vValues[i],
    rank: 0, // Will be set after sorting
  }));

  // Sort by score descending and assign ranks
  results.sort((a, b) => b.score - a.score);
  results.forEach((result, i) => {
    result.rank = i + 1;
  });

  return results;
};
