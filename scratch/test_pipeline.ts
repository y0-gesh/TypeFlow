import { cleanText } from "../src/utils/textCleaner";
import { splitSentences, createChunks } from "../src/utils/chunkGenerator";
import { contentEngine } from "../src/engines/contentEngine";
import * as assert from "assert";

function testTextCleaner() {
  console.log("Testing textCleaner...");
  const raw = "“Hello,” she said. `It's` a en–dash and em—dash.\r\nControl \u0000 characters and   extra   spaces.";
  const cleaned = cleanText(raw);
  
  assert.strictEqual(cleaned.includes("“"), false, "Should remove curly double quote open");
  assert.strictEqual(cleaned.includes("”"), false, "Should remove curly double quote close");
  assert.strictEqual(cleaned.includes("`"), false, "Should remove backticks");
  assert.strictEqual(cleaned.includes("–"), false, "Should replace en-dash");
  assert.strictEqual(cleaned.includes("—"), false, "Should replace em-dash");
  assert.strictEqual(cleaned.includes("\u0000"), false, "Should strip control characters");
  assert.strictEqual(cleaned.includes("   "), false, "Should normalize multiple spaces");
  
  console.log("✓ textCleaner passed!");
}

function testSentenceSplitting() {
  console.log("Testing sentenceSplitting...");
  const text = "Mr. John went to the store. Dr. Smith is there. She said e.g. this is a sentence! What about you? Yes.";
  const sentences = splitSentences(text);
  console.log("Found sentences:", sentences);
  
  assert.strictEqual(sentences.length, 5, `Should split into exactly 5 sentences. Found: ${sentences.length}`);
  assert.strictEqual(sentences[0], "Mr. John went to the store.");
  assert.strictEqual(sentences[1], "Dr. Smith is there.");
  assert.strictEqual(sentences[2], "She said e.g. this is a sentence!");
  assert.strictEqual(sentences[3], "What about you?");
  assert.strictEqual(sentences[4], "Yes.");
  console.log("✓ sentenceSplitting passed!");
}

function testChunkGenerator() {
  console.log("Testing chunkGenerator...");
  
  // Test simple chunking
  const sentences = [
    "This is the first sentence.",
    "This is the second sentence.",
    "This is the third sentence that is slightly longer to fill space."
  ];
  const chunks = createChunks(sentences);
  assert.ok(chunks.length > 0, "Should generate chunks");
  
  // Verify length constraints
  for (const chunk of chunks) {
    assert.ok(chunk.length >= 20 && chunk.length <= 200, `Chunk length should be within range: ${chunk.length}`);
  }

  // Test extremely long sentence splitting
  const longSentence = "This is an extremely long sentence that contains a lot of text, and we expect the chunk generator to split it at phrase boundaries like commas, semicolons, and colons so that it does not exceed the limit of 180 characters per chunk.";
  const longChunks = createChunks([longSentence]);
  for (const chunk of longChunks) {
    assert.ok(chunk.length <= 200, `Long sentence chunk length should not exceed 200: ${chunk.length}`);
  }
  
  console.log("✓ chunkGenerator passed!");
}

function testStructuralSegmenter() {
  console.log("Testing structuralSegmenter...");
  
  // Test chapter division on header patterns
  const docText = `
    Chapter 1: The Beginning
    This is the first chapter text. It describes the beginning of the journey.
    
    Chapter 2: The Middle
    This is the second chapter. It describes the challenges faced in the middle.
  `;
  
  const chapters = contentEngine.processDocument(docText);
  assert.strictEqual(chapters.length, 2, `Should detect exactly 2 chapters. Found: ${chapters.length}`);
  assert.strictEqual(chapters[0].title, "The Beginning");
  assert.strictEqual(chapters[1].title, "The Middle");
  
  // Test fallback division on plain text
  const plainText = "This is a plain text block. ".repeat(600); // 28 * 600 = 16800 chars
  const fallbackChapters = contentEngine.processDocument(plainText);
  assert.ok(fallbackChapters.length >= 2, `Should split large text into multiple chapters. Found: ${fallbackChapters.length}`);
  
  console.log("✓ structuralSegmenter passed!");
}

try {
  testTextCleaner();
  testSentenceSplitting();
  testChunkGenerator();
  testStructuralSegmenter();
  console.log("\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULY! 🎉");
} catch (e) {
  console.error("❌ TEST FAILED ❌");
  console.error(e);
  process.exit(1);
}
