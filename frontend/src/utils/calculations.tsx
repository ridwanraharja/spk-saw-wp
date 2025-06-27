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
    id: `saw-${alt.id}-${Date.now()}`,
    spkId: `spk-${Date.now()}`,
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
  // Step 1: Calculate relative weights (same as backend)
  const totalWeight = criteria.reduce((sum, crit) => sum + crit.weight, 0);
  const relativeWeights = criteria.map((crit) => crit.weight / totalWeight);

  // Step 2: Calculate Si values (same as backend)
  const scores = alternatives.map((alternative) => {
    let siValue = 1;

    relativeWeights.forEach((relativeWeight, index) => {
      const criterion = criteria[index];
      const value = alternative.values[criterion.id] || 0;

      if (value > 0) {
        if (criterion.type === "benefit") {
          siValue *= Math.pow(value, relativeWeight);
        } else {
          siValue *= Math.pow(1 / value, relativeWeight);
        }
      }
    });

    return {
      alternativeId: alternative.id,
      score: siValue,
      rank: 0,
    };
  });

  // Step 3: Calculate Vi values (preference values) - same as backend
  const totalSi = scores.reduce((sum, score) => sum + score.score, 0);
  scores.forEach((score) => {
    score.score = score.score / totalSi;
  });

  // Step 4: Sort by score (descending) and assign ranks (same as backend)
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((result, index) => {
    result.rank = index + 1;
  });

  // Step 5: Create results with proper types
  const results: WPResult[] = scores.map((score) => ({
    id: `wp-${score.alternativeId}-${Date.now()}`,
    spkId: `spk-${Date.now()}`,
    alternativeId: score.alternativeId,
    score: score.score,
    rank: score.rank,
  }));

  return results;
};
