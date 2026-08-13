const natural = require("natural");

// categories + training words
const categoryWords = {
  Food: ["food", "pizza", "burger", "restaurant", "coffee", "lunch", "dinner"],
  Travel: ["uber", "bus", "train", "taxi", "flight", "petrol", "fuel"],
  Bills: ["electricity", "rent", "internet", "water", "bill", "recharge"],
  Shopping: ["clothes", "amazon", "flipkart", "laptop", "mobile", "shoes"],
  Entertainment: ["movie", "netflix", "game", "concert"]
};

function categorizeExpense(text) {
  text = text.toLowerCase();

  let bestCategory = "General";
  let highestScore = 0;

  for (let category in categoryWords) {
    for (let word of categoryWords[category]) {
      const score = natural.JaroWinklerDistance(text, word);

      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }
  }

  return bestCategory;
}

module.exports = categorizeExpense;
