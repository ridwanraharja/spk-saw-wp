// SPK (Sistem Pendukung Keputusan) Calculations
// Implements SAW (Simple Additive Weighting) and WP (Weighted Product) methods

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
}

export interface Alternative {
  id: string;
  name: string;
  values: { [criterionId: string]: number };
}

export interface SPKResult {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
}

export class SPKCalculator {
  // SAW (Simple Additive Weighting) Method
  static calculateSAW(
    criteria: Criterion[],
    alternatives: Alternative[]
  ): SPKResult[] {
    // Step 1: Normalize the decision matrix
    const normalizedMatrix = this.normalizeMatrix(criteria, alternatives);

    // Step 2: Calculate weighted scores
    const scores = alternatives.map((alternative) => {
      let totalScore = 0;

      criteria.forEach((criterion) => {
        const normalizedValue = normalizedMatrix[alternative.id][criterion.id];
        totalScore += normalizedValue * criterion.weight;
      });

      return {
        alternativeId: alternative.id,
        alternativeName: alternative.name,
        score: totalScore,
        rank: 0, // Will be assigned after sorting
      };
    });

    // Step 3: Sort by score (descending) and assign ranks
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((result, index) => {
      result.rank = index + 1;
    });

    return scores;
  }

  // WP (Weighted Product) Method
  static calculateWP(
    criteria: Criterion[],
    alternatives: Alternative[]
  ): SPKResult[] {
    // Step 1: Calculate relative weights
    const totalWeight = criteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0
    );
    const relativeWeights = criteria.map((criterion) => ({
      ...criterion,
      relativeWeight: criterion.weight / totalWeight,
    }));

    // Step 2: Calculate Si values
    const scores = alternatives.map((alternative) => {
      let siValue = 1;

      relativeWeights.forEach((criterion) => {
        const value = alternative.values[criterion.id];
        if (criterion.type === "benefit") {
          siValue *= Math.pow(value, criterion.relativeWeight);
        } else {
          siValue *= Math.pow(1 / value, criterion.relativeWeight);
        }
      });

      return {
        alternativeId: alternative.id,
        alternativeName: alternative.name,
        score: siValue,
        rank: 0,
      };
    });

    // Step 3: Calculate Vi values (preference values)
    const totalSi = scores.reduce((sum, score) => sum + score.score, 0);
    scores.forEach((score) => {
      score.score = score.score / totalSi;
    });

    // Step 4: Sort by score (descending) and assign ranks
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((result, index) => {
      result.rank = index + 1;
    });

    return scores;
  }

  // Normalize decision matrix for SAW method
  private static normalizeMatrix(
    criteria: Criterion[],
    alternatives: Alternative[]
  ): { [alternativeId: string]: { [criterionId: string]: number } } {
    const normalizedMatrix: {
      [alternativeId: string]: { [criterionId: string]: number };
    } = {};

    // Initialize matrix
    alternatives.forEach((alternative) => {
      normalizedMatrix[alternative.id] = {};
    });

    criteria.forEach((criterion) => {
      const values = alternatives.map((alt) => alt.values[criterion.id]);

      if (criterion.type === "benefit") {
        // For benefit criteria: normalize by dividing by maximum value
        const maxValue = Math.max(...values);
        alternatives.forEach((alternative) => {
          normalizedMatrix[alternative.id][criterion.id] =
            alternative.values[criterion.id] / maxValue;
        });
      } else {
        // For cost criteria: normalize by dividing minimum value by each value
        const minValue = Math.min(...values);
        alternatives.forEach((alternative) => {
          normalizedMatrix[alternative.id][criterion.id] =
            minValue / alternative.values[criterion.id];
        });
      }
    });

    return normalizedMatrix;
  }

  // Validate input data
  static validateInputData(
    criteria: Criterion[],
    alternatives: Alternative[]
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check criteria
    if (criteria.length < 2) {
      errors.push("At least 2 criteria are required");
    }

    // Check alternatives
    if (alternatives.length < 2) {
      errors.push("At least 2 alternatives are required");
    }

    // Check weights sum to 1
    const totalWeight = criteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0
    );
    if (Math.abs(totalWeight - 1) > 0.001) {
      errors.push("Criteria weights must sum to 1");
    }

    // Check if all alternatives have values for all criteria
    criteria.forEach((criterion) => {
      alternatives.forEach((alternative) => {
        if (!(criterion.id in alternative.values)) {
          errors.push(
            `Alternative ${alternative.name} missing value for criterion ${criterion.name}`
          );
        }
      });
    });

    // Check for positive values
    alternatives.forEach((alternative) => {
      criteria.forEach((criterion) => {
        const value = alternative.values[criterion.id];
        if (value <= 0) {
          errors.push(
            `All values must be positive. Found ${value} for ${alternative.name} - ${criterion.name}`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
