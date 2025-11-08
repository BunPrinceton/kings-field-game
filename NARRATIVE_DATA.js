// NARRATIVE_DATA.js
// Implementation-ready narrative content for King's Field-style game
// Import and use these data structures to add rich storytelling to the game

export const NARRATIVE_DATA = {

  // ============================================================================
  // ENEMY DESCRIPTIONS
  // ============================================================================

  enemies: {
    remnant: {
      name: "Remnant",
      examineText: "A shuddering sphere of condensed anguish. You feel its hunger before you see it. It does not know what it wants from you. Only that it wants.",
      defeatText: "The sphere collapses inward, and for a moment you hear something—a sigh, perhaps, or the memory of one. Then silence.",
      firstEncounterText: "The crimson orb hovers before you, its surface roiling like disturbed water. Shapes press against it from within—a hand, a face, screaming silently.",
      lore: "These are what remains when a scholar's consciousness fragments completely—raw emotion and reflex without thought or purpose. They are drawn to living minds like moths to flame, seeking to devour what they can no longer possess."
    },

    // Future enemy types (not yet implemented)
    scribe: {
      name: "The Scribe",
      examineText: "It writes: 'The intruder bleeds. The intruder falls. The intruder is catalogued.' You feel the weight of its certainty pressing against possibility.",
      defeatText: "The quill drops. The scroll scatters. The final entry reads: 'Observation terminated.'",
      lore: "Low-ranking members of the Order, trapped mid-documentation. They cannot stop recording. When they write about intruders, their observations become prescriptive—they write what should happen, and the Archive enforces their narrative."
    },

    archivist: {
      name: "The Archivist",
      examineText: "It has not looked up from its book in three centuries. The pages are blank. This does not concern it.",
      defeatText: "The book closes. The Archivist crumbles to dust, leaving only the tome. Its pages are still blank.",
      lore: "Senior scholars who directed the experiment. Their consciousness remains mostly intact, but they no longer distinguish between organizing knowledge and organizing reality. To them, everything is simply data to be categorized, including you."
    },

    echo: {
      name: "Echo",
      examineText: "A scholar, walking to a lecture they gave three hundred years ago. They will never arrive. They will never stop trying.",
      interactText: "Passing through the Echo feels like ice water in your veins. Your vision blurs with memories that are not yours.",
      lore: "Memory loops, fragments of moments caught in temporal amber. They are not aware and cannot be killed—you can only avoid them or endure them."
    }
  },

  // ============================================================================
  // ITEM DESCRIPTIONS
  // ============================================================================

  items: {
    weapons: {
      wornShortsword: {
        name: "Worn Shortsword",
        description: "A practical blade, well-maintained but unremarkable. Its previous owner carved a single word into the pommel: 'RETURN'. They did not.",
        stats: { damage: 25, range: "close" },
        flavorText: "Every blade in the Archive has claimed lives. Most belonged to those who wielded them."
      },

      chronophageDagger: {
        name: "Chronophage Dagger",
        description: "The blade seems to exist a fraction of a second ahead of where it appears. Strikes land before they are made. The Order used these to harvest moments from living subjects. The screaming is psychosomatic.",
        stats: { damage: 20, range: "close", special: "Interrupt chance" },
        flavorText: "Time is not meant to be cut. It protests each strike."
      },

      nullMace: {
        name: "Null Mace",
        description: "Forged from compacted paradox—matter that both exists and doesn't. Heavy beyond its size. When it strikes, it doesn't damage so much as erase a portion of what was.",
        stats: { damage: 40, range: "close", special: "Slow, ignores armor" },
        flavorText: "Existence is negotiable. This proves it."
      },

      quillOfTheFinalTheorem: {
        name: "Quill of the Final Theorem",
        description: "The Order's ultimate tool: a quill that writes reality. Each strike inscribes wounds into existence with scholarly precision. The ink never runs dry. It is not ink.",
        stats: { damage: 35, range: "medium", special: "Ranged, mark enemies" },
        flavorText: "The pen is mightier than the sword because it determines whether swords exist."
      }
    },

    consumables: {
      phialOfMoments: {
        name: "Phial of Moments",
        description: "A crystallized droplet of time, stolen from somewhere that no longer exists. Drinking it grants the sensation of infinite duration—seconds stretch into hours. Use wisely. The debt comes due.",
        effect: "Slows enemy movement for 30 seconds",
        useText: "Time thickens around you. The world moves through honey."
      },

      candleOfPersistentLight: {
        name: "Candle of Persistent Light",
        description: "This flame has burned since before the Archive fell. It will burn after you are gone. Holding it provides comfort, though you cannot explain why.",
        effect: "Increases visibility range, slight health regeneration",
        useText: "The flame flickers but does not diminish. You are not alone. Almost."
      },

      fragmentOfCertainty: {
        name: "Fragment of Certainty",
        description: "A shard of concentrated belief, crystallized from a scholar who knew, absolutely, that they would succeed. They were wrong. The conviction remains.",
        effect: "Restores 50 HP",
        useText: "For a moment, you are certain you will survive. The feeling fades. The health remains."
      },

      tinctureOfForgetting: {
        name: "Tincture of Forgetting",
        description: "Smells of lavender and mercy. The Order gave these to subjects after... difficult procedures. Some researchers took them recreationally. Some never stopped.",
        effect: "Removes negative status effects, minor HP restore",
        useText: "You forget why you were afraid. The danger remains. You don't care."
      }
    },

    keyItems: {
      cipherLens: {
        name: "Cipher Lens",
        description: "A monocle of warped glass. When worn, hidden text becomes visible, scratched into walls by those who learned too much. Most of it is warnings. None of it is helpful.",
        effect: "Reveals hidden messages",
        equipText: "The world sharpens. Too sharp. You see things written in the margins of reality."
      },

      waystoneFragment: {
        name: "Waystone Fragment",
        description: "Warm to the touch, pulsing faintly. The Order used these to navigate the Archive's shifting geometry. This one is broken. It points somewhere that isn't on any map.",
        effect: "Unlocks fast travel",
        useText: "The stone hums. Space folds. You are elsewhere."
      }
    }
  },

  // ============================================================================
  // ENVIRONMENTAL EXAMINE TEXT
  // ============================================================================

  examineObjects: {
    torch: {
      text: "This torch has burned for three hundred years without consuming itself. The flame is cold to the touch. Scholars used to debate whether it was fire at all, or simply the memory of fire. The debate was never resolved.",
      variant: [
        "The fire does not warm. It illuminates. Nothing more.",
        "Perpetual flame. The Archive's heartbeat, frozen mid-pulse."
      ]
    },

    bloodstain: {
      text: "The blood is still wet. It has been wet for decades. Time cannot decide if this death is past or pending.",
      variant: [
        "Crimson. Fresh. Impossible. Touch it. Your finger comes away clean. The blood remains.",
        "Someone died here. Or will die here. The Archive makes no distinction."
      ]
    },

    scatteredScrolls: {
      text: "Research notes, covered in precise handwriting. The same sentence, written thousands of times: 'The experiment is a success. We cannot stop it. Please stop it. It worked perfectly.'",
      canPickUp: false
    },

    brokenHourglass: {
      text: "The sand flows upward. The glass is intact. Both of these facts are true.",
      variant: [
        "Time measures itself incorrectly here.",
        "The hourglass is not broken. Reality is."
      ]
    },

    scholarDesk: {
      text: "A workspace frozen mid-use. Quill still wet with ink, scroll half-written. The text reads: 'I can feel myself forgetting the difference between yesterday and tomorrow. This is the seventeenth time I have written this sentence. I think.'",
      canPickUp: true,
      lootTable: ["fragmentOfCertainty", "scrollFragment"]
    },

    ceremonialBrazier: {
      text: "Cold and dark. Ashes in the basin have formed into words: 'WITNESS MEMORY HOLLOW WITNESS MEMORY.' The pattern repeats, perfectly, impossibly.",
      variant: [
        "The ashes spell warnings in a language you don't know but understand.",
        "The brazier has been cold for centuries. The smoke still rises."
      ]
    },

    lockedDoor: {
      text: "The door is warm. From beyond, you hear breathing—slow, rhythmic, too large to be human. The lock is shaped like an eye.",
      requiresKey: "eyeKey",
      lockedText: "It watches you attempt entry. It does not approve."
    },

    mirror: {
      text: "Your reflection looks tired. More tired than you feel. It moves a fraction of a second after you do, as if copying you from memory.",
      variant: [
        "You and your reflection make eye contact. You look away first.",
        "The mirror shows you as you will be: exhausted, hollow, persistent."
      ]
    },

    bookshelf: {
      text: "Hundreds of tomes, spines labeled in languages that shift when you look directly at them. One book is warm. One book is breathing. Do not touch either.",
      canPickUp: false,
      dangerText: "Your hand reaches toward the breathing book. You stop yourself. Barely."
    }
  },

  // ============================================================================
  // SIGNS & INSCRIPTIONS
  // ============================================================================

  signs: {
    researchWing: {
      title: "SECTION VII - TEMPORAL MECHANICS",
      text: "AUTHORIZED PERSONNEL ONLY / OBSERVATION REQUIRED / WE ARE WATCHING WE ARE ALWAYS WATCHING",
      locationHint: "The air here feels heavy. Observed."
    },

    dormitory: {
      title: "SCHOLAR QUARTERS",
      text: "REMEMBER: SLEEP IS INEFFICIENT BUT MANDATORY / REPORT ALL DREAMS TO YOUR SUPERVISOR / THE PATTERNS MUST BE RECORDED",
      locationHint: "The beds are made. No one has slept here in three centuries. No one has woken, either."
    },

    library: {
      title: "WARNING",
      text: "BOOKS IN THIS SECTION ARE UNSTABLE / DO NOT READ ALOUD / DO NOT MEMORIZE / SOME KNOWLEDGE EATS BACKWARDS",
      locationHint: "The silence here is aggressive."
    },

    ritualChamber: {
      title: "CONTAINMENT BREACH PROTOCOL",
      text: "IN CASE OF CONSCIOUSNESS OVERFLOW: EVACUATE / SEAL CHAMBER / PRAY (INEFFECTIVE BUT TRADITIONAL)",
      locationHint: "This is where it happened. You can feel the scar in reality."
    }
  },

  // ============================================================================
  // LORE FRAGMENTS (Collectible Notes)
  // ============================================================================

  loreFragments: {
    fragment1: {
      title: "Research Log - Day 1",
      text: "We successfully extracted Subject 12's memory of their seventh birthday. Subject reports feeling 'lighter.' We have stored the memory in crystalline matrix. It remains stable. Subject 12 no longer remembers having a seventh birthday. They seem... relieved?",
      location: "Early game area",
      series: "The First Experiments"
    },

    fragment2: {
      title: "Progress Report - Month 6",
      text: "Seventeen subjects have volunteered for full consciousness transfer. The vessels are prepared. Council is concerned about ethical implications, but Project Lead assures us the subjects will thank us. I wonder if gratitude remains when you are no longer yourself.",
      location: "Mid game area",
      series: "The First Experiments"
    },

    fragment3: {
      title: "Emergency Notice - Month 8",
      text: "Something is wrong. The transferred consciousnesses are not stable. They are aware but not coherent. Subject 3 exists in seventeen different vessels simultaneously and is screaming in all of them. We cannot find the original. We are not sure there is an original anymore.",
      location: "Research wing",
      series: "The First Experiments"
    },

    fragment4: {
      title: "Final Warning - Day Unknown",
      text: "Time has stopped meaning what it meant. I am writing this note for the fourth time today or the first time ever. Both feel true. Do not use the Codex. Do not attempt reversal. The experiment succeeded. That is the problem. We are preserved perfectly, eternally, and we cannot endure it. Seal the Archive. Let us fade. For mercy's sake—",
      location: "Deep archive",
      series: "The First Experiments",
      incomplete: true
    },

    fragment5: {
      title: "The Nature of the Codex",
      text: "The Codex of Undoing is not a book. It is the Archive itself—every wall, every stone, every torch is a page. To read it is to exist within it. To understand it is to become it. The only way to undo the experiment is to replace it. Someone must take our place.",
      location: "Secret area",
      series: "The Codex",
      revelation: true
    }
  },

  // ============================================================================
  // LOCATION NAMES & DESCRIPTIONS
  // ============================================================================

  locations: {
    upperArchive: {
      thresholdOfKnowing: {
        name: "The Threshold of Knowing",
        discoveryText: "The entrance. The last chance to turn back. You do not turn back.",
        ambience: "Dust and silence. The weight of centuries.",
        dangerLevel: 1
      },

      galleryOfFirstPrinciples: {
        name: "Gallery of First Principles",
        discoveryText: "Hallways lined with empty frames. The portraits left when their subjects did.",
        ambience: "Echoing footsteps. Your breathing, too loud.",
        dangerLevel: 1
      },

      chamberOfInduction: {
        name: "Chamber of Induction",
        discoveryText: "Where new scholars took their oaths. The words still hang in the air, waiting to be spoken.",
        ambience: "A sense of ceremony, long abandoned.",
        dangerLevel: 2
      },

      provingGrounds: {
        name: "The Proving Grounds",
        discoveryText: "Training chambers. The practice dummies are scarred with centuries of strikes.",
        ambience: "The memory of exertion. Sweat and steel.",
        dangerLevel: 2,
        tutorial: true
      },

      vestibuleOfWhispers: {
        name: "Vestibule of Whispers",
        discoveryText: "The voices are not real. Probably not real. You hope they are not real.",
        ambience: "Soft whispers, just below comprehension.",
        dangerLevel: 2
      }
    },

    midArchive: {
      scriptoriumEternal: {
        name: "The Scriptorium Eternal",
        discoveryText: "Endless desks. Endless quills. Endless scratching. No one looks up at your arrival.",
        ambience: "The sound of writing, perpetual and maddening.",
        dangerLevel: 3
      },

      hallOfPersistentQuestions: {
        name: "Hall of Persistent Questions",
        discoveryText: "Every door is a riddle. Every answer creates two more questions.",
        ambience: "Silence that demands answers.",
        dangerLevel: 3,
        puzzleArea: true
      },

      cataloguingDepths: {
        name: "The Cataloguing Depths",
        discoveryText: "Where the Archivists sort infinity into categories. You are 'Intruder, Type Unknown.'",
        ambience: "The sound of pages turning. Forever.",
        dangerLevel: 4
      },

      gardenOfCrystallizedThought: {
        name: "Garden of Crystallized Thought",
        discoveryText: "Ideas, given form. Beautiful. Dangerous. Do not touch the singing stones.",
        ambience: "Musical hum, almost pleasant. Almost.",
        dangerLevel: 4,
        hazardArea: true
      },

      dormitoryOfEndlessNight: {
        name: "Dormitory of Endless Night",
        discoveryText: "The scholars sleep. They have slept for three hundred years. Do not wake them.",
        ambience: "Collective breathing. Slow. Too slow.",
        dangerLevel: 4
      }
    },

    deepArchive: {
      chronologyLaboratory: {
        name: "The Chronology Laboratory",
        discoveryText: "Where time was dissected. The experiments continue. You are the new variable.",
        ambience: "Ticking that doesn't match clocks. Time out of joint.",
        dangerLevel: 5,
        timeWarping: true
      },

      vaultOfUnfinishedTheorems: {
        name: "Vault of Unfinished Theorems",
        discoveryText: "Knowledge too dangerous to complete. Too valuable to destroy. Waiting.",
        ambience: "Potential energy. Ideas straining toward completion.",
        dangerLevel: 5
      },

      hollowingChamber: {
        name: "The Hollowing Chamber",
        discoveryText: "Where it happened. Where they became less than human. Where you may join them.",
        ambience: "Absence. The sound of nothing where something should be.",
        dangerLevel: 6,
        storyLocation: true
      },

      libraryOfSingularMoment: {
        name: "Library of Singular Moment",
        discoveryText: "Time has stopped. Completely. You move through frozen instants.",
        ambience: "Absolute silence. Even your heartbeat seems intrusive.",
        dangerLevel: 6,
        timeFrozen: true
      },

      stillHeart: {
        name: "The Still Heart",
        discoveryText: "The center. The source. The end. Everything leads here. Nothing leaves.",
        ambience: "The Archive's pulse. Arrested mid-beat.",
        dangerLevel: 7,
        finalArea: true
      }
    },

    secretAreas: {
      forgettingRoom: {
        name: "The Forgetting Room",
        discoveryText: "Peaceful. Too peaceful. You want to stay. You must not stay.",
        ambience: "Soft silence. Gentle. Lethal.",
        dangerLevel: 3,
        optional: true
      },

      ossuaryOfFalseNames: {
        name: "Ossuary of False Names",
        discoveryText: "Bones labeled with names that were never real. Identities shed like skin.",
        ambience: "Dry rattling. Whispers of 'who am I?'",
        dangerLevel: 5,
        optional: true
      },

      observersSanctum: {
        name: "The Observer's Sanctum",
        discoveryText: "Someone has been watching. Recording. Judging. Their notes are about you.",
        ambience: "The feeling of eyes. Constant. Everywhere.",
        dangerLevel: 6,
        bossArea: true,
        optional: true
      }
    }
  },

  // ============================================================================
  // UI FLAVOR TEXT
  // ============================================================================

  ui: {
    loadingTips: [
      "The Archive remembers your failures. Learn from them, or repeat them eternally.",
      "Time is broken here. Death may not mean what you expect.",
      "The Remnants were scholars once. They are not mindless. They are hollow. There is a difference.",
      "Every wall has a story scratched into it. Most are warnings.",
      "The deeper you go, the less the Archive resembles what it was. Or perhaps it resembles it too well.",
      "Fear the silence more than the screaming.",
      "The torches have burned for three centuries. You have minutes. Act accordingly.",
      "Echoes are currency here. Fragments of want, crystallized. The Archive generates them from dying wishes.",
      "The Merchant cannot leave. You should wonder why.",
      "Trust the Witness's data. Do not trust the Witness.",
      "Some doors are not locked. They simply do not wish to open.",
      "The Archive is alive. It breathes. It thinks. It judges.",
      "You are being catalogued with every step. The question is: as what?",
      "The scholars sought immortality. They achieved it. This is not a success story."
    ],

    deathMessages: [
      "You have failed. The Archive notes your attempt. [Deaths: {count}]",
      "Consciousness fragmenting. Memory persists. You remember dying.",
      "The Archive claims another. Your echoes scatter.",
      "You are catalogued as: DECEASED. The record is updated.",
      "Time resets. You do not. The weight accumulates.",
      "The Archive is patient. It has eternity. You do not.",
      "Your name joins the ledger of failures. You are not the first. You will not be the last.",
      "Death is not the end here. It is a data point. You are being measured."
    ],

    healthStates: {
      100: "You are whole. For now.",
      75: "Wounds accumulate. The Archive is patient.",
      50: "You are breaking. The Remnants can sense it.",
      25: "Consciousness fraying. Hold together. Just a little longer.",
      0: "You hollow."
    },

    levelUp: [
      "Knowledge earned through suffering. The Archive approves.",
      "You grow stronger. Or perhaps you forget what weakness felt like.",
      "Power gained. Price pending.",
      "The Archive observes your progress. Something watches with interest.",
      "Evolution through trauma. The Order would be proud.",
      "You adapt. The human will to survive, weaponized."
    ],

    areaDiscovery: {
      format: "[{areaName}] - {flavorText}",
      flavorTexts: [
        "The air changes. You are observed.",
        "This place has weight. Tread carefully.",
        "Time moves strangely here.",
        "The Archive deepens.",
        "Something waits ahead. It has been waiting a very long time.",
        "The silence here is different. Heavier.",
        "You feel the Archive's attention shift toward you."
      ]
    },

    restAtSafeZone: [
      "You rest. The Archive does not sleep, but you must.",
      "Temporary safety. The Merchant watches over you. You hope.",
      "A moment of peace. Savor it. It will not last.",
      "Your wounds close. Your mind frays. The trade is acceptable.",
      "The Archive permits your recovery. For now."
    ],

    itemPickup: {
      echo: "Echo absorbed. A fragment of someone's final want. It hums in your hand.",
      weapon: "Weapon acquired: {name}. Its previous owner is catalogued as deceased.",
      consumable: "Item acquired: {name}. Use wisely. The Archive provides little.",
      keyItem: "Key item acquired: {name}. This will open something. Or seal it."
    }
  },

  // ============================================================================
  // NPC DIALOGUE
  // ============================================================================

  npcs: {
    theWitness: {
      name: "The Witness",
      title: "Observer of Attempts",

      greetings: [
        "Fascinating. You chose the left path. Subject 117 chose right. They survived eight minutes longer. I wonder if you will break the record.",
        "Do you feel it yet? The weight of observation? Every step you take is being recorded. Every choice, catalogued. Does knowing this change your behavior? Please answer honestly. It affects the data.",
        "You are still afraid. Good. Fear is rational. The last subject who conquered their fear walked directly into the Hollowing Chamber singing. We are still cleaning up.",
        "Subject {playerID}. Progress: {completion}%. Survival time: {time}. Probability of success: {lowPercentage}%. These numbers are not encouraging, but they are honest."
      ],

      deathComments: [
        "Ah. Death number {count}. The pattern continues. Have you noticed you die most often to {commonEnemy}? Adaptation is possible. I recommend attempting it.",
        "Another reset. Your resilience is noted. Or perhaps this is stubbornness. The data is unclear.",
        "You have failed {count} times in {location}. This suggests a learning impediment. Or the area is simply too difficult. Both hypotheses have merit."
      ],

      progressComments: [
        "You defeated the Remnant in {time} seconds. Impressive. The last subject required {longerTime}. They are no longer with us.",
        "You have reached {location}. Only {lowPercentage}% of subjects make it this far. The fact that most of them die shortly after is... not relevant to this comment.",
        "Your combat efficiency is improving. Deaths per encounter declining. Either you learn quickly, or the data is flawed. I suspect the former."
      ],

      loreHints: [
        "The Archivists patrol on a schedule. Three centuries old, but they never deviate. Predictability is a weapon. Use it.",
        "The singing crystals in the Garden are not decorative. They are warnings. Singing means active. Active means dangerous. Silent means... also dangerous, but differently.",
        "The Merchant claims neutrality. Their presence here predates the fall. They have never explained how. I recommend not asking."
      ]
    },

    merchantOfLostThings: {
      name: "The Merchant of Lost Things",
      title: "Curator of Final Possessions",

      greetings: [
        "Back again? You're persistent. Or foolish. The line blurs down here.",
        "Still breathing? Remarkable. Most don't last this long. Sit. Rest. Die elsewhere, please. The cleaning is tedious.",
        "Another customer. The Archive provides. Mostly corpses, but occasionally survivors. Welcome, dearie.",
        "You have the look of someone who's seen things. The stare. The tremor. Yes, you'll fit right in. What are you buying?"
      ],

      shopDialogue: [
        "This blade belonged to someone who thought they were ready. You can have it. They won't be needing it. Neither will the person before them. Or the person before them.",
        "Echoes, dearie. That's the currency here. Fragments of moments, crystallized want. The Archive generates them when someone dies reaching for something. There's no shortage.",
        "That potion? Tincture of Forgetting. Popular item. Some buy it for the healing. Some buy it to forget why they're here. Both uses are valid.",
        "The prices are fair. I don't haggle. I don't need to. You'll pay, or you'll die and become inventory. Either way, the market balances."
      ],

      loreDialogue: [
        "Don't ask how I got here. Don't ask how I leave. Don't ask why I stay. Some questions are survivable only when left unasked.",
        "The Order? Brilliant minds, terrible ideas. They wanted to live forever. Succeeded, technically. Turns out forever is longer than they anticipated.",
        "You want to know about the Codex? Everyone does. Here's what I know: it's real, it's dangerous, and everyone who's found it has regretted it. Present company included. Don't ask."
      ],

      encouragement: [
        "You're doing better than most. That's not high praise, but it's sincere.",
        "The Archive respects persistence. Doesn't reward it, mind you. But respects it.",
        "Keep moving. Keep fighting. Keep dying and coming back. Eventually, you'll either win or stop caring. Both are forms of success."
      ],

      farewellMessages: [
        "Off you go. Try not to die immediately. It's embarrassing for both of us.",
        "Good luck. You'll need it. Bring back interesting loot. Or don't come back at all.",
        "The Archive waits for no one. Except me. It waits for me. Still haven't figured out why."
      ]
    },

    hollowScholar: {
      name: "The Hollow Scholar",
      title: "Fragment of {forgottenName}",

      firstMeeting: [
        "I... I was... my name is... was it Marcus? Martha? It begins with... no, that's someone else's name. I'm wearing their memory. Please, do you see a journal? Green cover? Or was it red? It contained my... my...",
        "[Suddenly clear] Listen. When you reach the Chronology Laboratory, do NOT touch the singing crystals. I don't remember why, but I remember the screaming that came after.",
        "You're... new. Fresh. Whole. I remember being whole. I think. Sometimes I remember being seventeen people. Sometimes I remember being nobody. I think I prefer nobody. It's simpler."
      ],

      questDialogue: {
        offer: "I had... belongings. Proof I existed. Three items. Scattered. If you find them, bring them here. Maybe I'll remember. Maybe I'll wish I hadn't. Both are acceptable.",

        reminder: "The items. Three of them. I think. Unless it was four. No, three. I'm certain. Mostly certain. Find them. Please.",

        completion: "You found them. My journal. My ring. My... what is this? I don't... wait. I remember. I remember everything. Oh. Oh no. I was... I did... [Long pause] Thank you. I think. The truth is worse than the forgetting. But it's mine. Thank you."
      },

      lucidMoments: [
        "[Clarity] The Archivists can't see you if you don't move when they're reading. They're categorizing their memories of the room, not the room itself. Stay still. You're not in their memory.",
        "[Clarity] The Forgetting Room feels safe because it is safe. It's also a trap. The longer you stay, the less you want to leave. Eventually, you forget there's an outside. Don't rest there long.",
        "[Clarity] I was part of the experiment. Volunteered. We all did. They promised us immortality. They delivered. This is what it looks like. Remember that when you find the Codex. Some promises should be broken."
      ],

      fragmentedMutterings: [
        "Seventeen... no, seven... or was it seventy... the number mattered once...",
        "My name my name my name is... was... will be... the tense is unclear...",
        "I can feel myself scattering. Like dust. Slow. Inevitable. Not unpleasant. Just... empty.",
        "Are you real? Am I? These questions used to have answers."
      ]
    }
  },

  // ============================================================================
  // QUEST DATA
  // ============================================================================

  quests: {
    whatRemains: {
      name: "What Remains",
      giver: "hollowScholar",
      type: "collection",

      objectives: [
        {
          type: "collect",
          item: "scholarJournal",
          location: "dormitoryOfEndlessNight",
          description: "Find the Hollow Scholar's journal"
        },
        {
          type: "collect",
          item: "signatureRing",
          location: "scriptoriumEternal",
          description: "Find the Hollow Scholar's ring"
        },
        {
          type: "collect",
          item: "memoryFragment",
          location: "chronologyLaboratory",
          description: "Find the memory fragment"
        }
      ],

      rewards: {
        echoes: 500,
        item: "fragmentOfIdentity",
        loreUnlock: "scholarTruth"
      },

      stages: {
        start: "The Hollow Scholar has asked you to find three items that might restore their memory. They seem uncertain whether this is wise.",
        progress: "You have found {count}/3 items. The Hollow Scholar waits, hopeful and terrified.",
        complete: "You have recovered all three items. The Hollow Scholar remembers everything. They thank you. Their eyes are full of regret."
      }
    },

    unfinishedTheorem: {
      name: "The Unfinished Theorem",
      giver: "theWitness",
      type: "retrieval",
      moral: true,

      objectives: [
        {
          type: "retrieve",
          item: "bookOfTheorem",
          location: "libraryOfSingularMoment",
          description: "Find the Book of Unfinished Theorems"
        },
        {
          type: "deliver",
          npc: "theWitness",
          description: "Return the book without reading it (optional)"
        }
      ],

      temptation: {
        trigger: "holdingBook",
        message: "The book whispers. It offers power. Understanding. Completion. You could read it. Just a glance.",
        consequence: "Reading grants power but alters ending path"
      },

      rewards: {
        notRead: {
          echoes: 1000,
          item: "quillOfTheFinalTheorem",
          dialogue: "You resisted. The data is valuable. Few can ignore the call of knowledge. You are stronger than most."
        },
        read: {
          echoes: 500,
          powerUp: true,
          endingLocked: "corruptedEnding",
          dialogue: "You read it. Of course you did. The power is yours. So is the consequence. The Archive watches with interest."
        }
      }
    },

    mercyForTheFallen: {
      name: "Mercy for the Fallen",
      giver: "merchantOfLostThings",
      type: "combat",

      objectives: [
        {
          type: "defeat",
          enemy: "remnant_marcus",
          location: "galleryOfFirstPrinciples",
          lore: "Former colleague, trapped as Remnant for 287 years"
        },
        {
          type: "defeat",
          enemy: "remnant_elara",
          location: "scriptoriumEternal",
          lore: "Senior scribe, consciousness degraded beyond recovery"
        },
        {
          type: "defeat",
          enemy: "remnant_thomas",
          location: "dormitoryOfEndlessNight",
          lore: "The Merchant's mentor, unrecognizable now"
        },
        {
          type: "defeat",
          enemy: "remnant_aria",
          location: "cataloguingDepths",
          lore: "Junior researcher, volunteered first, suffered longest"
        },
        {
          type: "defeat",
          enemy: "remnant_void",
          location: "hollowingChamber",
          lore: "Unknown identity, completely erased, only hunger remains"
        }
      ],

      rewards: {
        echoes: 750,
        blessing: "merchantsFavor",
        loreUnlock: "merchantPast"
      },

      storyBeats: {
        accept: "The Merchant's voice is heavy. 'They were people once. Brilliant, kind, foolish people. They're gone now. What remains... deserves rest. Give them that. Please.'",
        progress: "Each Remnant you destroy feels different. Not easier. Different. The Merchant thanks you quietly each time.",
        complete: "The Merchant is silent for a long time. 'Thank you,' they finally whisper. 'I've carried those names for three centuries. Now I can let them rest.' They give you a small blessing. Their eyes are distant."
      }
    }
  },

  // ============================================================================
  // GAME OPENING SEQUENCE
  // ============================================================================

  opening: {
    introText: [
      "You stand before the iron gate.",
      "Its surface is covered in script you cannot read but somehow understand:",
      "'To seek is to hollow. To know is to cease.",
      "Beyond this threshold, time has forgotten its purpose.'",
      "",
      "The gate opens at your touch, as if expecting you.",
      "",
      "The air that escapes smells of dust and candle wax and something else—",
      "the absence of decades, compressed into a single, patient breath.",
      "",
      "You descend."
    ],

    firstSteps: [
      "The air is still. The dust hasn't settled in three hundred years.",
      "Your footsteps echo. Nothing echoes back.",
      "Ahead, a single torch burns with cold fire.",
      "The Archive awaits."
    ]
  }
};

// Export for use in game
export default NARRATIVE_DATA;
