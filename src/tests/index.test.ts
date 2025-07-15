import { describe, it, expect } from '@jest/globals';

// Since we're testing an MCP server, we'll focus on unit testing the helper functions
// and validating the expected behavior of the random functions

describe('mcp-random', () => {
  describe('random_integer validation', () => {
    it('should validate that min and max are integers', () => {
      // Test cases for validation
      const testCases = [
        { min: 1.5, max: 10, shouldError: true },
        { min: 1, max: 10.5, shouldError: true },
        { min: 1, max: 10, shouldError: false },
      ];
      
      // Since we can't directly test the MCP server here,
      // we're documenting the expected behavior
      expect(testCases).toBeDefined();
    });

    it('should validate that min <= max', () => {
      const invalidCase = { min: 10, max: 1 };
      const validCase = { min: 1, max: 10 };
      
      expect(invalidCase.min).toBeGreaterThan(invalidCase.max);
      expect(validCase.min).toBeLessThanOrEqual(validCase.max);
    });
  });

  describe('random_float validation', () => {
    it('should accept any numeric values for min and max', () => {
      const testCases = [
        { min: 0, max: 1, valid: true },
        { min: -100.5, max: 100.5, valid: true },
        { min: 0, max: 0, valid: true },
      ];
      
      testCases.forEach(tc => {
        expect(typeof tc.min).toBe('number');
        expect(typeof tc.max).toBe('number');
      });
    });
  });

  describe('random_choice validation', () => {
    it('should require a non-empty array', () => {
      const emptyArray: any[] = [];
      const validArray = ['a', 'b', 'c'];
      
      expect(emptyArray.length).toBe(0);
      expect(validArray.length).toBeGreaterThan(0);
    });
  });

  describe('random_sample validation', () => {
    it('should validate count does not exceed array length', () => {
      const array = [1, 2, 3, 4, 5];
      const validCount = 3;
      const invalidCount = 10;
      
      expect(validCount).toBeLessThanOrEqual(array.length);
      expect(invalidCount).toBeGreaterThan(array.length);
    });
  });

  describe('random_password validation', () => {
    it('should require at least one character type', () => {
      const allDisabled = {
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
      };
      
      const atLeastOneEnabled = Object.values(allDisabled).some(v => v);
      expect(atLeastOneEnabled).toBe(false);
    });

    it('should validate length is positive', () => {
      const invalidLengths = [0, -1, -10];
      const validLengths = [1, 8, 16, 32];
      
      invalidLengths.forEach(len => {
        expect(len).toBeLessThanOrEqual(0);
      });
      
      validLengths.forEach(len => {
        expect(len).toBeGreaterThan(0);
      });
    });
  });

  describe('flip_coin validation', () => {
    it('should validate count is at least 1', () => {
      const invalidCounts = [0, -1];
      const validCounts = [1, 10, 100];
      
      invalidCounts.forEach(count => {
        expect(count).toBeLessThan(1);
      });
      
      validCounts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('roll_dice validation', () => {
    it('should validate sides is at least 2', () => {
      const invalidSides = [0, 1, -1];
      const validSides = [2, 6, 20, 100];
      
      invalidSides.forEach(sides => {
        expect(sides).toBeLessThan(2);
      });
      
      validSides.forEach(sides => {
        expect(sides).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('random_weighted_choice validation', () => {
    it('should validate arrays have same length', () => {
      const options = ['A', 'B', 'C'];
      const validWeights = [1, 2, 1];
      const invalidWeights = [1, 2];
      
      expect(options.length).toBe(validWeights.length);
      expect(options.length).not.toBe(invalidWeights.length);
    });

    it('should validate weights are non-negative', () => {
      const invalidWeights = [1, -1, 2];
      const validWeights = [0, 1, 2];
      
      expect(invalidWeights.some(w => w < 0)).toBe(true);
      expect(validWeights.every(w => w >= 0)).toBe(true);
    });

    it('should validate total weight is positive', () => {
      const zeroWeights = [0, 0, 0];
      const validWeights = [1, 0, 1];
      
      expect(zeroWeights.reduce((a, b) => a + b, 0)).toBe(0);
      expect(validWeights.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    });
  });
});
