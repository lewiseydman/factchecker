import { storage } from "./storage";

const exampleFactChecks = [
  {
    statement: "The Great Wall of China is visible from space with the naked eye",
    isTrue: false,
    explanation: "This is a persistent myth. The Great Wall of China is not visible from space with the naked eye. While it's an impressive structure, it's too narrow to be seen from such distances without aid.",
    historicalContext: "This myth has been perpetuated for decades, but astronauts have consistently debunked it. The wall is only about 30 feet wide on average.",
    sources: [
      { name: "NASA", url: "https://www.nasa.gov/vision/space/workinginspace/great_wall.html" },
      { name: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/science-nature/can-you-see-the-great-wall-of-china-from-space-165395/" }
    ],
    confidenceScore: 0.95,
    serviceBreakdown: [
      { name: "Claude", verdict: "False", confidence: 0.95 },
      { name: "OpenAI", verdict: "False", confidence: 0.93 },
      { name: "Perplexity", verdict: "False", confidence: 0.97 }
    ]
  },
  {
    statement: "Lightning never strikes the same place twice",
    isTrue: false,
    explanation: "Lightning frequently strikes the same place multiple times. Tall structures like the Empire State Building are struck by lightning around 25 times per year.",
    historicalContext: "This saying likely originated from the statistical improbability of witnessing lightning strike the same spot twice, but it's not scientifically accurate.",
    sources: [
      { name: "National Weather Service", url: "https://www.weather.gov/safety/lightning-myths" },
      { name: "Scientific American", url: "https://www.scientificamerican.com/article/fact-or-fiction-lightning-never-strikes-twice/" }
    ],
    confidenceScore: 0.92,
    serviceBreakdown: [
      { name: "Claude", verdict: "False", confidence: 0.94 },
      { name: "OpenAI", verdict: "False", confidence: 0.91 },
      { name: "Perplexity", verdict: "False", confidence: 0.92 }
    ]
  },
  {
    statement: "Humans only use 10% of their brain",
    isTrue: false,
    explanation: "Neuroimaging shows that humans use virtually every part of their brain, even during simple tasks. This myth has been thoroughly debunked by modern neuroscience.",
    historicalContext: "This myth may have originated from misquoted early neuroscience research and has been popularized in movies and self-help literature.",
    sources: [
      { name: "Scientific American", url: "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/" },
      { name: "Mayo Clinic", url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/expert-answers/brain/faq-20058147" }
    ],
    confidenceScore: 0.96,
    serviceBreakdown: [
      { name: "Claude", verdict: "False", confidence: 0.97 },
      { name: "OpenAI", verdict: "False", confidence: 0.95 },
      { name: "Perplexity", verdict: "False", confidence: 0.96 }
    ]
  },
  {
    statement: "The Earth is approximately 4.5 billion years old",
    isTrue: true,
    explanation: "Scientific evidence from radiometric dating of rocks and meteorites consistently shows Earth formed about 4.54 billion years ago.",
    historicalContext: "This age was determined through decades of geological research and radiometric dating techniques developed in the 20th century.",
    sources: [
      { name: "US Geological Survey", url: "https://www.usgs.gov/faqs/how-old-earth" },
      { name: "Nature", url: "https://www.nature.com/articles/nature02047" }
    ],
    confidenceScore: 0.98,
    serviceBreakdown: [
      { name: "Claude", verdict: "True", confidence: 0.98 },
      { name: "OpenAI", verdict: "True", confidence: 0.97 },
      { name: "Perplexity", verdict: "True", confidence: 0.99 }
    ]
  },
  {
    statement: "Vaccines cause autism",
    isTrue: false,
    explanation: "Extensive scientific research has found no credible link between vaccines and autism. The original study suggesting this link was fraudulent and retracted.",
    historicalContext: "This myth originated from a 1998 study by Andrew Wakefield that was later found to be fraudulent. The author lost his medical license.",
    sources: [
      { name: "CDC", url: "https://www.cdc.gov/vaccinesafety/concerns/autism.html" },
      { name: "The Lancet", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(10)60175-4/fulltext" }
    ],
    confidenceScore: 0.99,
    serviceBreakdown: [
      { name: "Claude", verdict: "False", confidence: 0.99 },
      { name: "OpenAI", verdict: "False", confidence: 0.98 },
      { name: "Perplexity", verdict: "False", confidence: 0.99 }
    ]
  },
  {
    statement: "Water boils at 100 degrees Celsius at sea level",
    isTrue: true,
    explanation: "At standard atmospheric pressure (1 atmosphere or 101.325 kPa), pure water boils at exactly 100°C (212°F). This is a fundamental physical property.",
    historicalContext: "This temperature was actually used to define the Celsius temperature scale, making it true by definition under standard conditions.",
    sources: [
      { name: "NIST", url: "https://physics.nist.gov/cgi-bin/cuu/Value?tpwtrp" },
      { name: "Encyclopedia Britannica", url: "https://www.britannica.com/science/boiling-point" }
    ],
    confidenceScore: 1.0,
    serviceBreakdown: [
      { name: "Claude", verdict: "True", confidence: 1.0 },
      { name: "OpenAI", verdict: "True", confidence: 0.99 },
      { name: "Perplexity", verdict: "True", confidence: 1.0 }
    ]
  },
  {
    statement: "Goldfish have a memory span of only 3 seconds",
    isTrue: false,
    explanation: "Goldfish actually have much longer memories, lasting weeks or even months. Studies have shown they can be trained to respond to different colors, sounds, and cues.",
    historicalContext: "This myth likely persists because it makes people feel better about keeping goldfish in small bowls, but it's scientifically inaccurate.",
    sources: [
      { name: "Animal Cognition Journal", url: "https://link.springer.com/article/10.1007/s10071-009-0230-2" },
      { name: "Fish and Fisheries", url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-2979.2004.00167.x" }
    ],
    confidenceScore: 0.94,
    serviceBreakdown: [
      { name: "Claude", verdict: "False", confidence: 0.95 },
      { name: "OpenAI", verdict: "False", confidence: 0.93 },
      { name: "Perplexity", verdict: "False", confidence: 0.94 }
    ]
  },
  {
    statement: "The human body is approximately 60% water",
    isTrue: true,
    explanation: "Adult human bodies are indeed about 60% water by weight, though this percentage varies by age, sex, and body composition. Infants have higher percentages.",
    historicalContext: "This figure has been consistently confirmed through various medical studies and is a fundamental fact in human physiology.",
    sources: [
      { name: "USGS", url: "https://www.usgs.gov/special-topics/water-science-school/science/water-you-water-and-human-body" },
      { name: "Mayo Clinic", url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256" }
    ],
    confidenceScore: 0.97,
    serviceBreakdown: [
      { name: "Claude", verdict: "True", confidence: 0.97 },
      { name: "OpenAI", verdict: "True", confidence: 0.96 },
      { name: "Perplexity", verdict: "True", confidence: 0.98 }
    ]
  },
  {
    statement: "Eating carrots improves your eyesight significantly",
    isTrue: false,
    explanation: "While carrots contain beta-carotene which converts to vitamin A (important for eye health), eating carrots won't significantly improve normal vision or cure vision problems.",
    historicalContext: "This myth was actually propaganda during WWII to hide the fact that Britain had developed radar technology for detecting enemy aircraft.",
    sources: [
      { name: "Harvard Health", url: "https://www.health.harvard.edu/blog/will-eating-carrots-improve-your-vision-2020010918728" },
      { name: "American Academy of Ophthalmology", url: "https://www.aao.org/eye-health/tips-prevention/nutrition" }
    ],
    confidenceScore: 0.88,
    serviceBreakdown: [
      { name: "Claude", verdict: "Mostly False", confidence: 0.89 },
      { name: "OpenAI", verdict: "False", confidence: 0.87 },
      { name: "Perplexity", verdict: "Mostly False", confidence: 0.88 }
    ]
  },
  {
    statement: "Mount Everest is the tallest mountain on Earth",
    isTrue: true,
    explanation: "Mount Everest stands at 8,848.86 meters (29,031.7 feet) above sea level, making it the highest point on Earth's surface.",
    historicalContext: "Everest was first measured by the Great Trigonometrical Survey of India in 1955. Recent measurements in 2020 confirmed the current official height.",
    sources: [
      { name: "National Geographic", url: "https://www.nationalgeographic.com/environment/article/mount-everest-height-nepal-china-agree" },
      { name: "BBC", url: "https://www.bbc.com/news/world-asia-55218443" }
    ],
    confidenceScore: 1.0,
    serviceBreakdown: [
      { name: "Claude", verdict: "True", confidence: 1.0 },
      { name: "OpenAI", verdict: "True", confidence: 0.99 },
      { name: "Perplexity", verdict: "True", confidence: 1.0 }
    ]
  }
];

export async function addExampleFactChecks() {
  console.log("Adding example fact checks...");
  
  // Use your existing user ID for these examples
  const demoUserId = "42853347";
  
  for (const example of exampleFactChecks) {
    try {
      const factCheck = await storage.createFactCheck({
        userId: demoUserId,
        statement: example.statement,
        isTrue: example.isTrue,
        explanation: example.explanation,
        historicalContext: example.historicalContext,
        sources: example.sources,
        savedByUser: false,
        confidenceScore: example.confidenceScore,
        serviceBreakdown: example.serviceBreakdown,
        tierName: "Premium",
        modelsUsed: 6
      });
      
      // Add to trending facts
      await storage.incrementChecksCount(Number(factCheck.id));
      
      console.log(`Added: ${example.statement.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Error adding example: ${error}`);
    }
  }
  
  console.log("Finished adding example fact checks!");
}

// Run the function
addExampleFactChecks().then(() => {
  console.log("Done!");
}).catch(console.error);