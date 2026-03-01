/**
 * Life Purpose Engine — The most important user value moment.
 *
 * Takes natal chart positions (North Node + MC + Sun + Saturn)
 * and generates deeply personalized life purpose insights using
 * Pearl's own interpretation framework.
 *
 * Output:
 *  - purpose_direction: What you're here to learn / become
 *  - career_alignment: How your design expresses through work
 *  - leadership_style: How you naturally lead / influence
 *  - fulfillment_drivers: What genuinely lights you up
 *  - long_term_path: The Saturn return / maturation arc
 */

// ────────────────────────────────────────────────────────────────
// Interpretation Tables — Pearl's Own Framework
// ────────────────────────────────────────────────────────────────

// North Node by sign — the soul's evolutionary direction
const NORTH_NODE_PURPOSE: Record<string, string> = {
  Aries: "You are here to cultivate courage, independence, and the willingness to put yourself first. Your soul has mastered the art of partnership and compromise — this lifetime asks you to discover who you are when you stand alone. Your purpose unfolds every time you choose authenticity over approval.",
  Taurus: "You are here to build something real — to ground your gifts in the material world and learn the art of patient creation. Your soul carries deep familiarity with intensity and transformation. Now it seeks peace, stability, and the quiet power of what endures.",
  Gemini: "You are here to learn, communicate, and connect. Your soul has spent lifetimes in pursuit of big-picture truth — now it needs the humility of curiosity, the joy of conversation, and the willingness to stay in the questions rather than rush to answers.",
  Cancer: "You are here to nurture — yourself first, then others. Your soul carries the weight of responsibility and public achievement. This lifetime asks you to build an inner home, to trust vulnerability, and to discover that emotional safety is not weakness but wisdom.",
  Leo: "You are here to shine. Your soul has spent lifetimes in service to the collective, often at the expense of personal expression. Now it craves center stage — not for ego, but for the joy of creating something only you can create. Your purpose lives in your willingness to be seen.",
  Virgo: "You are here to serve with precision and devotion. Your soul carries the mystical, the transcendent, the desire to dissolve boundaries. Now it must learn to show up in the details, to be useful, to find the sacred in the practical and the holy in the ordinary.",
  Libra: "You are here to learn the art of relationship, balance, and beauty. Your soul has been a warrior — fierce, independent, self-reliant. This lifetime asks you to soften, to consider others, to discover that collaboration is not a compromise but a completion.",
  Scorpio: "You are here for depth — emotional, psychological, spiritual. Your soul has mastered comfort, stability, and the material world. Now it must dive beneath the surface, face what others avoid, and discover the transformative power of radical honesty and surrender.",
  Sagittarius: "You are here to expand — through travel, philosophy, higher learning, and the pursuit of meaning. Your soul has been the student, the local expert, the gatherer of facts. Now it must become the teacher, the explorer, the one who trusts the journey more than the map.",
  Capricorn: "You are here to build legacy. Your soul has been the nurturer, the emotional anchor. This lifetime asks you to step into authority — not because you want power, but because the world needs your particular brand of disciplined, enduring vision.",
  Aquarius: "You are here for the collective — to innovate, liberate, and bring your unique vision to the community. Your soul has been the star, the center of attention. Now it must learn to shine for something larger than itself, to find purpose in contribution rather than applause.",
  Pisces: "You are here to dissolve — the boundaries between self and other, the walls between the mundane and the sacred. Your soul has been the analyst, the perfectionist, the one who fixes. Now it must learn to surrender, to trust the unseen, to find wisdom in not-knowing.",
};

// Midheaven by sign — how purpose expresses through career / public role
const MC_CAREER: Record<string, string> = {
  Aries: "Your public path calls you to pioneer, initiate, and lead from the front. You thrive when you can start new things, solve problems others won't touch, and be recognized for your courage. Entrepreneurship, athletics, emergency response, and any role where speed and decisiveness matter.",
  Taurus: "Your public path is built on beauty, value, and tangible results. You thrive in roles where you create lasting things — finance, design, real estate, agriculture, luxury goods. Your career satisfaction comes from seeing your work take physical form in the world.",
  Gemini: "Your public path runs through communication, ideas, and connection. Writing, teaching, media, marketing, translation — anything that lets you be the bridge between knowledge and people. You may have multiple career chapters, and that's by design.",
  Cancer: "Your public path involves nurturing on a larger scale. Healthcare, hospitality, real estate, family business, counseling. You bring emotional intelligence to professional spaces, and your greatest career achievements come when you make others feel safe and seen.",
  Leo: "Your public path demands creative expression and visibility. Entertainment, leadership, education, luxury brands, children's work. You are meant to be seen and celebrated for your unique creative gifts. Hiding your light is a disservice to your design.",
  Virgo: "Your public path is built on mastery, service, and meticulous craft. Healthcare, editing, data science, nutrition, quality assurance. You bring an extraordinary eye for detail that others rely on. Your career satisfaction comes from knowing your work is impeccable.",
  Libra: "Your public path involves justice, beauty, and partnership. Law, diplomacy, design, counseling, art curation. You bring harmony to professional spaces and thrive when you can mediate, beautify, or create fairness where none existed before.",
  Scorpio: "Your public path requires depth and transformation. Psychology, research, finance, detective work, crisis management. You're drawn to roles where you uncover what's hidden and help others through their deepest transitions. Power dynamics are your terrain.",
  Sagittarius: "Your public path is expansive — travel, education, publishing, philosophy, international work. You are meant to be the teacher, the guide, the one who broadens horizons. Your career thrives when it connects to meaning larger than the daily grind.",
  Capricorn: "Your public path demands authority, structure, and long-term vision. Executive leadership, architecture, government, project management. You are built for the long game. Your career may start slowly but builds to extraordinary heights over time.",
  Aquarius: "Your public path is futuristic and unconventional. Technology, social reform, science, nonprofit leadership, community organizing. You are meant to disrupt the status quo and bring innovative solutions to collective problems. Your career may look nothing like your parents'.",
  Pisces: "Your public path channels the transcendent into the world. Art, music, healing, spirituality, film, compassionate care. You bring an otherworldly quality to your work that moves people on levels they can't quite articulate. Trust your creative and spiritual gifts.",
};

// Sun by sign + house — natural leadership style
function getLeadershipStyle(sunSign: string, sunHouse: number): string {
  const signTraits: Record<string, string> = {
    Aries: "Your leadership is instinctual, bold, and action-oriented. You lead by example — when you move, others follow. You don't wait for consensus; you trust your impulse and course-correct as you go.",
    Taurus: "Your leadership is steady, grounded, and quietly powerful. You lead through consistency and reliability. People trust you because you don't waver, and you have an uncanny ability to create stability in chaos.",
    Gemini: "Your leadership is intellectual and adaptive. You lead through ideas, communication, and the ability to see multiple perspectives simultaneously. You make complex things simple and connect people who need each other.",
    Cancer: "Your leadership is emotional and protective. You lead by creating safety — emotional, psychological, sometimes physical. People do their best work around you because they feel genuinely cared for.",
    Leo: "Your leadership is magnetic and inspiring. You lead through vision, warmth, and the sheer force of your creative presence. People follow you because you make them believe in something bigger than the task at hand.",
    Virgo: "Your leadership is precise and service-oriented. You lead by demonstrating excellence and lifting the standard for everyone around you. People trust you because you've done the work, checked the details, and thought through the contingencies.",
    Libra: "Your leadership is collaborative and justice-oriented. You lead through fairness, diplomacy, and the ability to hold space for competing needs. People follow you because they know you'll consider every perspective before deciding.",
    Scorpio: "Your leadership is intense and transformational. You lead through depth — you see what others miss, confront what others avoid, and hold steady in crises that would break lesser leaders. People follow you because they know you can handle the truth.",
    Sagittarius: "Your leadership is visionary and expansive. You lead through meaning — you connect daily work to a larger purpose and inspire people to think bigger. People follow you because you genuinely believe in something worth believing in.",
    Capricorn: "Your leadership is authoritative and enduring. You lead through discipline, strategic thinking, and an unwavering commitment to the long-term goal. People follow you because they trust your judgment and your track record.",
    Aquarius: "Your leadership is innovative and egalitarian. You lead through ideas and ideals, often disrupting the way things have always been done. People follow you because you see a future that doesn't exist yet and make it feel inevitable.",
    Pisces: "Your leadership is intuitive and compassionate. You lead through empathy, creativity, and an ability to sense what a group needs before it's spoken. People follow you because you make them feel understood on a level that transcends words.",
  };

  const houseContext: Record<number, string> = {
    1: "In the 1st house, your leadership is personal and immediate — you lead by being fully, unapologetically yourself.",
    2: "In the 2nd house, your leadership connects to resources and values — you lead through what you build and what you're willing to invest in.",
    3: "In the 3rd house, your leadership is communicative — you lead through words, ideas, and the power of naming what's true.",
    4: "In the 4th house, your leadership is foundational — you lead from a deep inner center, and your greatest influence may be in private rather than public spheres.",
    5: "In the 5th house, your leadership is creative — you lead through self-expression, play, and the courage to create something original.",
    6: "In the 6th house, your leadership is through service — you lead by showing up daily, doing the unglamorous work, and elevating the standard of craft.",
    7: "In the 7th house, your leadership unfolds through partnership — you lead best when you have a collaborator who balances your strengths.",
    8: "In the 8th house, your leadership involves transformation — you lead through crises, shared resources, and the willingness to go where others fear.",
    9: "In the 9th house, your leadership is philosophical — you lead through teaching, publishing, and expanding the collective understanding of what's possible.",
    10: "In the 10th house, your leadership is public and professional — you are designed for visible authority, and the world will notice your contribution.",
    11: "In the 11th house, your leadership serves the collective — you lead through community, networks, and the power of shared vision.",
    12: "In the 12th house, your leadership is behind the scenes — you lead through spiritual or institutional work, and your greatest impact may be invisible to the public eye.",
  };

  return `${signTraits[sunSign] || signTraits["Aries"]}\n\n${houseContext[sunHouse] || houseContext[1]}`;
}

// Saturn by sign + house — long-term maturation path
function getLongTermPath(saturnSign: string, saturnHouse: number): string {
  const saturnLessons: Record<string, string> = {
    Aries: "Saturn in Aries asks you to master the art of healthy assertion. Your long-term growth comes through learning to act from authority rather than reactivity, to lead without aggression, and to be patient with your own ambition.",
    Taurus: "Saturn in Taurus asks you to master your relationship with the material world. Your long-term growth comes through building genuine security — not from scarcity, but from the disciplined cultivation of your resources and values.",
    Gemini: "Saturn in Gemini asks you to master your mind. Your long-term growth comes through disciplined thinking, deep study, and the courage to commit to ideas rather than skimming surfaces. Your words carry weight — learn to use them with precision.",
    Cancer: "Saturn in Cancer asks you to master your emotional life. Your long-term growth comes through building genuine emotional security from within, setting healthy boundaries with family, and learning that vulnerability requires more strength than armor.",
    Leo: "Saturn in Leo asks you to master authentic self-expression. Your long-term growth comes through the discipline of creating from the heart rather than for applause, and learning that true recognition comes to those who create with integrity.",
    Virgo: "Saturn in Virgo asks you to master service without self-sacrifice. Your long-term growth comes through perfecting your craft without perfectionism, serving others without losing yourself, and finding order in the chaos without needing to control everything.",
    Libra: "Saturn in Libra asks you to master the art of fair partnership. Your long-term growth comes through learning to balance your own needs with others', to commit without losing yourself, and to create justice rather than just keeping the peace.",
    Scorpio: "Saturn in Scorpio asks you to master transformation itself. Your long-term growth comes through facing your deepest fears, developing emotional resilience, and learning that true power comes from surrender rather than control.",
    Sagittarius: "Saturn in Sagittarius asks you to master your beliefs. Your long-term growth comes through questioning what you've been taught, building a philosophy that's truly yours, and learning that wisdom requires the discipline of ongoing inquiry.",
    Capricorn: "Saturn in Capricorn asks you to master authority. Your long-term growth comes through building something of genuine lasting value, accepting leadership with humility, and learning that ambition aligned with integrity is unstoppable.",
    Aquarius: "Saturn in Aquarius asks you to master your individuality within the collective. Your long-term growth comes through balancing innovation with responsibility, serving community without losing your autonomy, and building systems that outlive you.",
    Pisces: "Saturn in Pisces asks you to master the boundary between self and the infinite. Your long-term growth comes through grounding your spiritual gifts in practical application, learning healthy escape vs. avoidance, and trusting your intuition with discipline.",
  };

  const houseMaturation: Record<number, string> = {
    1: "With Saturn in the 1st house, your maturation journey is deeply personal. Over time, you develop a quiet, unshakeable authority that comes from knowing exactly who you are. The early years may feel heavy, but you age like fine wine.",
    2: "With Saturn in the 2nd house, your maturation involves your relationship with money, resources, and self-worth. Financial wisdom comes with time, and your greatest asset is the discipline you bring to building sustainable value.",
    3: "With Saturn in the 3rd house, your maturation happens through communication and learning. Early struggles with expression give way to a powerful, respected voice. Your words become more potent with every decade.",
    4: "With Saturn in the 4th house, your maturation involves family and foundations. Early home life may have been heavy or restrictive, but you build an unshakeable inner foundation that becomes your greatest source of strength.",
    5: "With Saturn in the 5th house, your maturation involves creativity and joy. Learning to play, create, and express yourself freely may not come easily, but the creative mastery you develop over time is profound and enduring.",
    6: "With Saturn in the 6th house, your maturation happens through work and health. You develop extraordinary professional discipline and may become a master of your craft. Your body asks for consistent, loving attention.",
    7: "With Saturn in the 7th house, your maturation unfolds through partnership. Relationships are your greatest teacher. Committed partnerships may come later or feel heavy at first, but they become the foundation of your most important growth.",
    8: "With Saturn in the 8th house, your maturation involves the deep waters — shared resources, intimacy, transformation. You develop extraordinary resilience and the capacity to hold space for life's most intense passages.",
    9: "With Saturn in the 9th house, your maturation comes through higher learning, travel, and philosophy. Your worldview may start narrow but expands with discipline and experience into something genuinely wise and hard-won.",
    10: "With Saturn in the 10th house, your maturation is public and professional. Career success builds slowly but culminates powerfully. You may carry heavy responsibility, but you are designed for exactly this kind of enduring contribution.",
    11: "With Saturn in the 11th house, your maturation involves community and future vision. Finding your people may take time, but the networks you eventually build are strong, lasting, and aligned with your deepest values.",
    12: "With Saturn in the 12th house, your maturation is largely internal and spiritual. You carry a deep karmic weight that lightens with self-awareness. Your greatest strength develops in solitude and contemplation.",
  };

  return `${saturnLessons[saturnSign] || saturnLessons["Capricorn"]}\n\n${houseMaturation[saturnHouse] || houseMaturation[10]}`;
}

// North Node by house — fulfillment drivers
const NORTH_NODE_FULFILLMENT: Record<number, string> = {
  1: "You are most fulfilled when you prioritize your own path, even if it means standing apart from others. Self-discovery, personal projects, physical vitality, and the courage to be a beginner all light you up. Stop waiting for permission — your fulfillment lives on the other side of initiative.",
  2: "You are most fulfilled when you build something tangible, enjoy sensory beauty, and trust that you are enough. Financial independence, working with your hands, slow pleasures, and the art of receiving. Stop overcomplicating — your fulfillment lives in simplicity and presence.",
  3: "You are most fulfilled when you are learning, teaching, writing, or in conversation. Local community, siblings, short trips, and the free exchange of ideas all energize you. Stop searching for the grand theory — your fulfillment lives in the daily exchange of curiosity.",
  4: "You are most fulfilled when you feel emotionally at home — within yourself, within your family, within your living space. Cooking, nesting, ancestral work, and creating emotional safety for yourself and others. Your fulfillment lives in the private sphere.",
  5: "You are most fulfilled when you are creating, playing, and expressing yourself without reservation. Art, children, romance, performance, and anything that requires you to put your heart on display. Your fulfillment lives in the courage to be fully, joyfully you.",
  6: "You are most fulfilled when you are of service, when your daily work has purpose, and when your body and environment are well-tended. Health routines, mentoring, craftsmanship, and the sacred art of being useful. Your fulfillment lives in devotion to the small and holy.",
  7: "You are most fulfilled in genuine partnership — romantic, creative, or professional. One-on-one connections, collaboration, diplomacy, and the art of truly seeing another person. Your fulfillment lives in the space between you and another.",
  8: "You are most fulfilled when you go deep — psychologically, spiritually, financially. Intimacy, shared resources, research, transformation work, and the courage to face what others avoid. Your fulfillment lives in the depths, not the shallows.",
  9: "You are most fulfilled when you are expanding — through travel, higher education, philosophical inquiry, and cross-cultural exchange. Teaching, publishing, and adventure all fuel you. Your fulfillment lives in the pursuit of meaning beyond the familiar.",
  10: "You are most fulfilled when you are building a legacy, earning public recognition, and taking on responsibility that matches your capacity. Career achievement, leadership, and the patient construction of something that lasts. Your fulfillment lives in your public contribution.",
  11: "You are most fulfilled when you are part of something larger — community, activism, innovation, or collective vision. Friendship, group projects, humanitarian work, and the freedom to be different. Your fulfillment lives in your contribution to the future.",
  12: "You are most fulfilled in surrender — meditation, artistic flow, spiritual practice, compassion work. Solitude, dreams, and the dissolution of ego boundaries. Your fulfillment lives in letting go of what you think you need and trusting the unseen.",
};

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export interface LifePurposeResult {
  purposeDirection: string;
  careerAlignment: string;
  leadershipStyle: string;
  fulfillmentDrivers: string;
  longTermPath: string;
}

/**
 * Generate the Life Purpose Profile from natal chart data.
 * This is the "most important user value moment" — shown immediately after signup.
 */
export function generateLifePurpose(
  northNodeSign: string,
  northNodeHouse: number,
  midheavenSign: string,
  sunSign: string,
  sunHouse: number,
  saturnSign: string,
  saturnHouse: number,
): LifePurposeResult {
  return {
    purposeDirection: NORTH_NODE_PURPOSE[northNodeSign] || NORTH_NODE_PURPOSE["Aries"],
    careerAlignment: MC_CAREER[midheavenSign] || MC_CAREER["Aries"],
    leadershipStyle: getLeadershipStyle(sunSign, sunHouse),
    fulfillmentDrivers: NORTH_NODE_FULFILLMENT[northNodeHouse] || NORTH_NODE_FULFILLMENT[1],
    longTermPath: getLongTermPath(saturnSign, saturnHouse),
  };
}
