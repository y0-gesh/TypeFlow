import { cleanText } from "../src/utils/textCleaner";
import { splitSentences, createChunks, createBalancedChunks, countWords } from "../src/utils/chunkGenerator";
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
  
  assert.strictEqual(sentences.length, 5, `Should split into exactly 5 sentences. Found: ${sentences.length}`);
  assert.strictEqual(sentences[0], "Mr. John went to the store.");
  assert.strictEqual(sentences[1], "Dr. Smith is there.");
  assert.strictEqual(sentences[2], "She said e.g. this is a sentence!");
  assert.strictEqual(sentences[3], "What about you?");
  assert.strictEqual(sentences[4], "Yes.");
  console.log("✓ sentenceSplitting passed!");
}

function testChunkGenerator() {
  console.log("Testing balanced 50-100 words chunkGenerator...");

  // 1. Test paragraph with <= 100 words is NOT broken
  const singleParagraph65Words = 
    "The art of typing accurately requires deliberate practice and patience each single day. " +
    "When you focus on hitting every key with proper posture and finger placement, your speed naturally builds over time without unnecessary fatigue. " +
    "Many beginners make the fatal mistake of rushing before they have built solid muscle memory, which leads to repeated errors and frustration down the line. " +
    "Keep practicing smoothly.";

  const wordsInSingle = countWords(singleParagraph65Words);
  assert.ok(wordsInSingle <= 100, `Single paragraph must have <= 100 words. Has: ${wordsInSingle}`);
  assert.ok(wordsInSingle >= 50, `Single paragraph must have >= 50 words. Has: ${wordsInSingle}`);

  const chunksSingle = createBalancedChunks(singleParagraph65Words);
  assert.strictEqual(chunksSingle.length, 1, `Paragraph <= 100 words should NOT be broken. Got: ${chunksSingle.length}`);
  assert.strictEqual(chunksSingle[0].trim(), singleParagraph65Words.trim(), "Chunk text should equal full paragraph intact");

  // 2. Test paragraph with > 100 words is split at sentence period after 50 words
  // Construct a paragraph with 4 distinct sentences, totaling ~125 words
  const sentenceA = "Learning to type with all ten fingers is an essential modern skill that saves countless hours over the course of a professional career in technology, engineering, writing, or academic research."; // 28 words
  const sentenceB = "By spending just fifteen minutes every morning on targeted drills, you train your brain and hands to coordinate smoothly without needing to look down at the keyboard layout."; // 29 words
  // Cumulative A + B = 57 words (exceeds 50 words, sentence B ends with a period!)
  const sentenceC = "Over time, this deliberate habit develops lightning fast muscle memory that translates to seamless prose and effortless programming sessions without the constant friction of backspacing."; // 26 words
  const sentenceD = "Furthermore, practicing with authentic literary books and custom uploaded notes makes the entire learning experience significantly more stimulating, memorable, engaging, and intellectually rewarding for every dedicated typist."; // 28 words
  // Cumulative C + D = 54 words

  const largeParagraph = `${sentenceA} ${sentenceB} ${sentenceC} ${sentenceD}`;
  const largeWords = countWords(largeParagraph);
  assert.ok(largeWords > 100, `Paragraph should exceed 100 words. Got: ${largeWords}`);

  const chunksLarge = createBalancedChunks(largeParagraph);
  console.log(`Large paragraph (${largeWords} words) split into ${chunksLarge.length} chunks:`);
  chunksLarge.forEach((c, idx) => console.log(`  Chunk ${idx + 1} (${countWords(c)} words): ${c.substring(0, 50)}...`));

  assert.strictEqual(chunksLarge.length, 2, `Should split into 2 chunks. Found: ${chunksLarge.length}`);
  
  // First chunk covers till the period after 50 words (sentence A + sentence B)
  const chunk1Words = countWords(chunksLarge[0]);
  const chunk2Words = countWords(chunksLarge[1]);
  assert.ok(chunk1Words >= 50 && chunk1Words <= 100, `Chunk 1 should be between 50 and 100 words. Got: ${chunk1Words}`);
  assert.ok(chunk2Words >= 50 && chunk2Words <= 100, `Chunk 2 should be between 50 and 100 words. Got: ${chunk2Words}`);
  assert.ok(chunksLarge[0].endsWith("layout."), "Chunk 1 must end at the sentence period of sentence B");
  assert.ok(chunksLarge[1].endsWith("typist."), "Chunk 2 must end at the sentence period of sentence D");

  // 3. Test multiple small paragraphs combined without breaking paragraphs
  const para1 = "Short paragraph one introduces the chapter theme with clarity and conciseness, setting the stage for subsequent discussion."; // 17 words
  const para2 = "Short paragraph two continues the thought by illustrating a specific scenario where students practice daily with discipline."; // 18 words
  const para3 = "Short paragraph three concludes this initial introductory section, giving readers an encouraging message before advancing forward."; // 16 words
  // 17 + 18 + 16 = 51 words total!
  const combinedParas = `${para1}\n\n${para2}\n\n${para3}`;
  const totalParasWords = countWords(combinedParas);
  const multiChunks = createBalancedChunks(combinedParas);
  assert.strictEqual(multiChunks.length, 1, `Small paragraphs totaling ${totalParasWords} words should merge without breaking any paragraph. Found: ${multiChunks.length}`);
  assert.strictEqual(countWords(multiChunks[0]), totalParasWords, "Combined chunk should have all words");
  assert.ok(multiChunks[0].includes(para1) && multiChunks[0].includes(para2) && multiChunks[0].includes(para3), "All paragraphs remain full and unbroken");

  console.log("✓ chunkGenerator passed!");
}

function testStructuralSegmenter() {
  console.log("Testing structuralSegmenter with balanced chunks...");
  
  // Test chapter division on header patterns
  const docText = `
    Chapter 1: The Beginning
    The journey of a thousand miles begins with a single step forward into the unknown world of digital craftsmanship.
    When aspiring typists sit down before their mechanical keyboards, they enter a realm where speed and accuracy merge into rhythm.
    Dedication and patience are the twin keys that unlock true mastery, turning difficult drills into an effortless flow state.
    
    Chapter 2: The Middle
    Every challenge encountered along the path presents an opportunity to refine posture and strengthen individual finger dexterity.
    Through relentless determination and disciplined practice routines, difficult symbols and punctuation marks become second nature.
    Consistency transforms ordinary learners into virtuosos who can transcribe thoughts directly onto the screen at breathtaking speeds.
  `;
  
  const chapters = contentEngine.processDocument(docText);
  assert.strictEqual(chapters.length, 2, `Should detect exactly 2 chapters. Found: ${chapters.length}`);
  assert.strictEqual(chapters[0].title, "The Beginning");
  assert.strictEqual(chapters[1].title, "The Middle");
  
  for (const chap of chapters) {
    assert.ok(chap.lessons.length > 0, `Chapter ${chap.title} should have lessons`);
    for (const les of chap.lessons) {
      const wCount = countWords(les.content);
      assert.ok(wCount >= 40 && wCount <= 110, `Lesson chunk word count should be balanced. Got: ${wCount}`);
    }
  }
  
  console.log("✓ structuralSegmenter passed!");
}

try {
  testTextCleaner();
  testSentenceSplitting();
  testChunkGenerator();
  testStructuralSegmenter();
  console.log("\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULLY! 🎉");
} catch (e) {
  console.error("❌ TEST FAILED ❌");
  console.error(e);
  process.exit(1);
}
