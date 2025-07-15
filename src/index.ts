#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as crypto from 'crypto';

// Documentation embedded in the tool
const HELP_DOCUMENTATION = `
# MCP Random Server Documentation

This server provides true randomness capabilities to Claude through various functions.

## Available Functions:

### random_integer(min, max)
Returns a random integer between min and max (inclusive).
- min: Minimum value (integer)
- max: Maximum value (integer)
- Example: random_integer(1, 10) might return 7

### random_float(min, max, precision?)
Returns a random floating-point number between min and max.
- min: Minimum value (number)
- max: Maximum value (number)
- precision: Optional decimal places (default: 10)
- Example: random_float(0, 1, 2) might return 0.42

### random_choice(options)
Randomly selects one item from an array of options.
- options: Array of any items to choose from
- Example: random_choice(["red", "green", "blue"]) might return "green"

### random_sample(array, count)
Randomly selects multiple unique items from an array (without replacement).
- array: Source array to sample from
- count: Number of items to select
- Example: random_sample([1,2,3,4,5], 3) might return [2,5,1]

### random_shuffle(array)
Returns a shuffled copy of the input array.
- array: Array to shuffle
- Example: random_shuffle([1,2,3,4]) might return [3,1,4,2]

### random_uuid()
Generates a random UUID v4.
- No parameters
- Example: returns "550e8400-e29b-41d4-a716-446655440000"

### random_bytes(count, encoding?)
Generates random bytes.
- count: Number of bytes to generate
- encoding: Optional encoding ('hex', 'base64', 'base64url') - default is 'hex'
- Example: random_bytes(16, 'hex') returns 32 hex characters

### flip_coin(count?)
Flips one or more coins.
- count: Optional number of flips (default: 1)
- Returns: Single result ("heads"/"tails") or array of results

### roll_dice(sides, count?)
Rolls one or more dice.
- sides: Number of sides on each die
- count: Optional number of dice to roll (default: 1)
- Returns: Single result or sum of multiple dice

### random_normal(mean?, stddev?)
Generates a random number from a normal distribution.
- mean: Mean of the distribution (default: 0)
- stddev: Standard deviation (default: 1)
- Uses Box-Muller transform

### random_weighted_choice(options, weights)
Selects an option based on weighted probabilities.
- options: Array of options
- weights: Array of weights (same length as options)
- Example: random_weighted_choice(["A", "B", "C"], [1, 2, 1]) - B is twice as likely

### random_password(length?, options?)
Generates a secure random password.
- length: Password length (default: 16)
- options: Object with boolean flags:
  - uppercase: Include uppercase letters (default: true)
  - lowercase: Include lowercase letters (default: true)
  - numbers: Include numbers (default: true)
  - symbols: Include symbols (default: true)
  - excludeSimilar: Exclude similar characters like 0/O, 1/l (default: false)

### help()
Returns this documentation.

## Use Cases:

1. **Decision Making**: Use flip_coin() or random_choice() for binary or multiple choice decisions
2. **Games**: Use roll_dice() for game mechanics, random_shuffle() for card games
3. **Sampling**: Use random_sample() for statistical sampling or A/B testing
4. **Security**: Use random_uuid() or random_password() for secure identifiers
5. **Simulations**: Use random_normal() for Monte Carlo simulations
6. **Creative**: Use random_choice() with creative prompts or elements

## Technical Notes:
- All randomness is cryptographically secure using Node.js crypto module
- Functions are deterministic given the same random bytes
- No state is maintained between calls
`;

const server = new Server(
  {
    name: 'mcp-random',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to generate random integers
function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);
  
  let randomValue;
  do {
    randomValue = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded);
  } while (randomValue >= threshold);
  
  return min + (randomValue % range);
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'random_integer',
        description: 'Generate a random integer between min and max (inclusive)',
        inputSchema: {
          type: 'object',
          properties: {
            min: { type: 'number', description: 'Minimum value (inclusive)' },
            max: { type: 'number', description: 'Maximum value (inclusive)' },
          },
          required: ['min', 'max'],
        },
      },
      {
        name: 'random_float',
        description: 'Generate a random floating-point number between min and max',
        inputSchema: {
          type: 'object',
          properties: {
            min: { type: 'number', description: 'Minimum value' },
            max: { type: 'number', description: 'Maximum value' },
            precision: { type: 'number', description: 'Decimal places (default: 10)' },
          },
          required: ['min', 'max'],
        },
      },
      {
        name: 'random_choice',
        description: 'Randomly select one item from an array of options',
        inputSchema: {
          type: 'object',
          properties: {
            options: { 
              type: 'array', 
              description: 'Array of options to choose from',
              items: {}
            },
          },
          required: ['options'],
        },
      },
      {
        name: 'random_sample',
        description: 'Randomly select multiple unique items from an array (without replacement)',
        inputSchema: {
          type: 'object',
          properties: {
            array: { 
              type: 'array', 
              description: 'Array to sample from',
              items: {}
            },
            count: { type: 'number', description: 'Number of items to select' },
          },
          required: ['array', 'count'],
        },
      },
      {
        name: 'random_shuffle',
        description: 'Return a shuffled copy of the input array',
        inputSchema: {
          type: 'object',
          properties: {
            array: { 
              type: 'array', 
              description: 'Array to shuffle',
              items: {}
            },
          },
          required: ['array'],
        },
      },
      {
        name: 'random_uuid',
        description: 'Generate a random UUID v4',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'random_bytes',
        description: 'Generate random bytes',
        inputSchema: {
          type: 'object',
          properties: {
            count: { type: 'number', description: 'Number of bytes to generate' },
            encoding: { 
              type: 'string', 
              description: 'Output encoding (hex, base64, base64url)',
              enum: ['hex', 'base64', 'base64url']
            },
          },
          required: ['count'],
        },
      },
      {
        name: 'flip_coin',
        description: 'Flip a coin (or multiple coins)',
        inputSchema: {
          type: 'object',
          properties: {
            count: { type: 'number', description: 'Number of coins to flip (default: 1)' },
          },
        },
      },
      {
        name: 'roll_dice',
        description: 'Roll dice with specified number of sides',
        inputSchema: {
          type: 'object',
          properties: {
            sides: { type: 'number', description: 'Number of sides on the die' },
            count: { type: 'number', description: 'Number of dice to roll (default: 1)' },
          },
          required: ['sides'],
        },
      },
      {
        name: 'random_normal',
        description: 'Generate a random number from a normal distribution',
        inputSchema: {
          type: 'object',
          properties: {
            mean: { type: 'number', description: 'Mean of the distribution (default: 0)' },
            stddev: { type: 'number', description: 'Standard deviation (default: 1)' },
          },
        },
      },
      {
        name: 'random_weighted_choice',
        description: 'Select an option based on weighted probabilities',
        inputSchema: {
          type: 'object',
          properties: {
            options: { 
              type: 'array', 
              description: 'Array of options',
              items: {}
            },
            weights: { 
              type: 'array', 
              description: 'Array of weights (same length as options)',
              items: { type: 'number' }
            },
          },
          required: ['options', 'weights'],
        },
      },
      {
        name: 'random_password',
        description: 'Generate a secure random password',
        inputSchema: {
          type: 'object',
          properties: {
            length: { type: 'number', description: 'Password length (default: 16)' },
            options: {
              type: 'object',
              description: 'Password generation options',
              properties: {
                uppercase: { type: 'boolean', description: 'Include uppercase letters (default: true)' },
                lowercase: { type: 'boolean', description: 'Include lowercase letters (default: true)' },
                numbers: { type: 'boolean', description: 'Include numbers (default: true)' },
                symbols: { type: 'boolean', description: 'Include symbols (default: true)' },
                excludeSimilar: { type: 'boolean', description: 'Exclude similar characters (0/O, 1/l)' },
              },
            },
          },
        },
      },
      {
        name: 'help',
        description: 'Get comprehensive documentation for all random functions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'random_integer': {
        const { min, max } = args as { min: number; max: number };
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
          throw new Error('Both min and max must be integers');
        }
        if (min > max) {
          throw new Error('min must be less than or equal to max');
        }
        const result = randomInt(min, max);
        return {
          content: [{ type: 'text', text: result.toString() }],
        };
      }

      case 'random_float': {
        const { min, max, precision = 10 } = args as { min: number; max: number; precision?: number };
        if (min > max) {
          throw new Error('min must be less than or equal to max');
        }
        const randomBytes = crypto.randomBytes(8);
        const randomValue = randomBytes.readDoubleLE(0);
        const normalized = Math.abs(randomValue) / Number.MAX_VALUE;
        const result = min + (normalized * (max - min));
        const rounded = parseFloat(result.toFixed(precision));
        return {
          content: [{ type: 'text', text: rounded.toString() }],
        };
      }

      case 'random_choice': {
        const { options } = args as { options: any[] };
        if (!Array.isArray(options) || options.length === 0) {
          throw new Error('options must be a non-empty array');
        }
        const index = randomInt(0, options.length - 1);
        return {
          content: [{ type: 'text', text: JSON.stringify(options[index]) }],
        };
      }

      case 'random_sample': {
        const { array, count } = args as { array: any[]; count: number };
        if (!Array.isArray(array)) {
          throw new Error('array must be an array');
        }
        if (count > array.length) {
          throw new Error('count cannot be greater than array length');
        }
        if (count < 0) {
          throw new Error('count must be non-negative');
        }
        
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = randomInt(0, i);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return {
          content: [{ type: 'text', text: JSON.stringify(shuffled.slice(0, count)) }],
        };
      }

      case 'random_shuffle': {
        const { array } = args as { array: any[] };
        if (!Array.isArray(array)) {
          throw new Error('array must be an array');
        }
        
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = randomInt(0, i);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return {
          content: [{ type: 'text', text: JSON.stringify(shuffled) }],
        };
      }

      case 'random_uuid': {
        const uuid = crypto.randomUUID();
        return {
          content: [{ type: 'text', text: uuid }],
        };
      }

      case 'random_bytes': {
        const { count, encoding = 'hex' } = args as { count: number; encoding?: string };
        if (count <= 0) {
          throw new Error('count must be positive');
        }
        const bytes = crypto.randomBytes(count);
        let result: string;
        switch (encoding) {
          case 'base64':
            result = bytes.toString('base64');
            break;
          case 'base64url':
            result = bytes.toString('base64url');
            break;
          case 'hex':
          default:
            result = bytes.toString('hex');
        }
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'flip_coin': {
        const { count = 1 } = args as { count?: number };
        if (count < 1) {
          throw new Error('count must be at least 1');
        }
        
        if (count === 1) {
          const result = randomInt(0, 1) === 0 ? 'heads' : 'tails';
          return {
            content: [{ type: 'text', text: result }],
          };
        } else {
          const results = Array(count).fill(null).map(() => 
            randomInt(0, 1) === 0 ? 'heads' : 'tails'
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(results) }],
          };
        }
      }

      case 'roll_dice': {
        const { sides, count = 1 } = args as { sides: number; count?: number };
        if (sides < 2) {
          throw new Error('dice must have at least 2 sides');
        }
        if (count < 1) {
          throw new Error('count must be at least 1');
        }
        
        const rolls = Array(count).fill(null).map(() => randomInt(1, sides));
        if (count === 1) {
          return {
            content: [{ type: 'text', text: rolls[0].toString() }],
          };
        } else {
          const sum = rolls.reduce((a, b) => a + b, 0);
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify({ rolls, sum }) 
            }],
          };
        }
      }

      case 'random_normal': {
        const { mean = 0, stddev = 1 } = args as { mean?: number; stddev?: number };
        // Box-Muller transform
        const u1 = crypto.randomBytes(8).readDoubleLE(0) / Number.MAX_VALUE;
        const u2 = crypto.randomBytes(8).readDoubleLE(0) / Number.MAX_VALUE;
        const z0 = Math.sqrt(-2 * Math.log(Math.abs(u1))) * Math.cos(2 * Math.PI * u2);
        const result = mean + (z0 * stddev);
        return {
          content: [{ type: 'text', text: result.toString() }],
        };
      }

      case 'random_weighted_choice': {
        const { options, weights } = args as { options: any[]; weights: number[] };
        if (!Array.isArray(options) || !Array.isArray(weights)) {
          throw new Error('options and weights must be arrays');
        }
        if (options.length !== weights.length) {
          throw new Error('options and weights must have the same length');
        }
        if (options.length === 0) {
          throw new Error('options cannot be empty');
        }
        if (weights.some(w => w < 0)) {
          throw new Error('weights must be non-negative');
        }
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        if (totalWeight === 0) {
          throw new Error('total weight must be positive');
        }
        
        const random = Math.random() * totalWeight;
        let cumulative = 0;
        for (let i = 0; i < options.length; i++) {
          cumulative += weights[i];
          if (random < cumulative) {
            return {
              content: [{ type: 'text', text: JSON.stringify(options[i]) }],
            };
          }
        }
        
        // Fallback (should not reach here)
        return {
          content: [{ type: 'text', text: JSON.stringify(options[options.length - 1]) }],
        };
      }

      case 'random_password': {
        const { length = 16, options = {} } = args as { 
          length?: number; 
          options?: {
            uppercase?: boolean;
            lowercase?: boolean;
            numbers?: boolean;
            symbols?: boolean;
            excludeSimilar?: boolean;
          }
        };
        
        if (length < 1) {
          throw new Error('length must be at least 1');
        }
        
        const opts = {
          uppercase: options.uppercase !== false,
          lowercase: options.lowercase !== false,
          numbers: options.numbers !== false,
          symbols: options.symbols !== false,
          excludeSimilar: options.excludeSimilar || false,
        };
        
        let charset = '';
        if (opts.uppercase) {
          charset += opts.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (opts.lowercase) {
          charset += opts.excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        }
        if (opts.numbers) {
          charset += opts.excludeSimilar ? '23456789' : '0123456789';
        }
        if (opts.symbols) {
          charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        if (charset.length === 0) {
          throw new Error('At least one character type must be enabled');
        }
        
        const password = Array(length).fill(null).map(() => 
          charset[randomInt(0, charset.length - 1)]
        ).join('');
        
        return {
          content: [{ type: 'text', text: password }],
        };
      }

      case 'help': {
        return {
          content: [{ type: 'text', text: HELP_DOCUMENTATION }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }],
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
console.error('mcp-random MCP server running on stdio');
