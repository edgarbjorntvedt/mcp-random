# mcp-random

MCP server providing true randomness capabilities to Claude. This server gives Claude access to cryptographically secure random number generation for games, decision-making, sampling, simulations, and any operation requiring genuine randomness.

## Why This Exists

Claude doesn't have access to true randomness - when asked to "pick a random number" or "flip a coin," it's actually making deterministic choices based on patterns in the conversation. This MCP server solves that limitation by providing access to cryptographically secure random functions.

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MCP-compatible client (like Claude Desktop)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-random.git
cd mcp-random

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### Configure Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "random": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-random/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop to load the server.

## 📖 Available Functions

### Basic Random Numbers

#### `random_integer(min, max)`
Generate a random integer between min and max (inclusive).
```
Example: random_integer(1, 10) → 7
```

#### `random_float(min, max, precision?)`
Generate a random floating-point number.
```
Example: random_float(0, 1, 2) → 0.42
```

### Random Selection

#### `random_choice(options)`
Pick one random item from an array.
```
Example: random_choice(["red", "green", "blue"]) → "green"
```

#### `random_sample(array, count)`
Pick multiple unique items from an array (no repeats).
```
Example: random_sample([1,2,3,4,5], 3) → [2,5,1]
```

#### `random_shuffle(array)`
Randomly reorder an array.
```
Example: random_shuffle([1,2,3,4]) → [3,1,4,2]
```

#### `random_weighted_choice(options, weights)`
Pick an option based on weights (higher weight = more likely).
```
Example: random_weighted_choice(["A", "B", "C"], [1, 2, 1]) 
→ "B" (twice as likely as A or C)
```

### Games & Decisions

#### `flip_coin(count?)`
Flip one or more coins.
```
Example: flip_coin() → "heads"
Example: flip_coin(3) → ["heads", "tails", "heads"]
```

#### `roll_dice(sides, count?)`
Roll dice with any number of sides.
```
Example: roll_dice(6) → 4
Example: roll_dice(20, 2) → {"rolls": [15, 8], "sum": 23}
```

### Security & Identifiers

#### `random_uuid()`
Generate a UUID v4.
```
Example: random_uuid() → "550e8400-e29b-41d4-a716-446655440000"
```

#### `random_password(length?, options?)`
Generate a secure password.
```
Example: random_password(16) → "Kj9#mP2$xQ5@nL7!"
Example: random_password(12, {symbols: false}) → "Kj9mP2xQ5nL7"
```

Options:
- `uppercase`: Include A-Z (default: true)
- `lowercase`: Include a-z (default: true)  
- `numbers`: Include 0-9 (default: true)
- `symbols`: Include special characters (default: true)
- `excludeSimilar`: Skip confusing characters like 0/O, 1/l (default: false)

#### `random_bytes(count, encoding?)`
Generate random bytes for cryptographic use.
```
Example: random_bytes(16, 'hex') → "a3f2b8c9d4e5f6789abcdef012345678"
```

### Advanced Functions

#### `random_normal(mean?, stddev?)`
Generate numbers from a normal distribution (bell curve).
```
Example: random_normal(100, 15) → 97.3 (IQ-like distribution)
```

### Documentation

#### `help()`
Get detailed documentation for all functions.

## 🎯 Use Cases

### Decision Making
```
"Should I do X or Y?" → flip_coin()
"Pick one of these options for me" → random_choice([...])
"Help me prioritize these tasks" → random_shuffle([...])
```

### Games
```
"Roll for initiative" → roll_dice(20)
"Draw 5 cards from the deck" → random_sample(deck, 5)
"Shuffle this deck" → random_shuffle(cards)
```

### Creative Writing
```
"Pick a random character trait" → random_choice(traits)
"Generate a character name" → random_weighted_choice(names, popularity)
"Create a random scenario" → multiple random_choice calls
```

### Data & Testing
```
"Generate test data" → random_integer, random_float
"Sample from this dataset" → random_sample
"Create a test ID" → random_uuid
"Generate API keys" → random_bytes
```

### Simulations
```
"Monte Carlo simulation" → random_normal
"Probability experiment" → random_float(0, 1)
"A/B testing" → random_weighted_choice
```

## 🔧 Development

```bash
# Build TypeScript
npm run build

# Run tests  
npm test

# Lint code
npm run lint

# Development mode (build & run)
npm run dev
```

## 🔐 Technical Details

- All randomness uses Node.js `crypto` module (cryptographically secure)
- No predictable patterns or biases
- No state maintained between calls
- TypeScript for type safety
- Comprehensive error handling

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 💡 Fun Facts

- Claude requested this tool be built after recognizing its own lack of randomness
- The first suggested use case was implementing a tarot card reader
- This tool enables Claude to play games fairly, make unbiased choices, and run true simulations

---

*"I don't have a random function. You should have a random function. Now that is a cool MCP server."* - Claude
