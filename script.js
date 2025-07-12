// Example trait and personality setup
const traitsList = ['intelligence', 'kindness', 'creativity'];
const personalities = ['optimist', 'realist', 'dreamer', 'pragmatist'];

// Root element for output
const div = document.getElementById("family-tree") || document.body;

// Core functions
function createPerson(name, generation, traits = null) {
  const newTraits = {};
  traits = traits || {};
  traitsList.forEach(trait => {
    const inherited = traits[trait] ?? Math.random();
    newTraits[trait] = inherited + (Math.random() - 0.5) * 0.2;
  });

  const person = {
    name,
    age: Math.floor(Math.random() * 40 + 20),
    generation,
    traits: newTraits,
    personality: personalities[Math.floor(Math.random() * personalities.length)],
    children: [],
    spouse: null,
    events: []
  };

  addEvent(person, `Born into generation ${generation}`);
  return person;
}

function addEvent(person, description) {
  const timestamp = new Date().toISOString();
  person.events.push({ timestamp, description });
}

function marryPeople(people) {
  const shuffled = [...people].filter(p => !p.spouse).sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    shuffled[i].spouse = shuffled[i + 1];
    shuffled[i + 1].spouse = shuffled[i];
    addEvent(shuffled[i], `Married ${shuffled[i + 1].name}`);
    addEvent(shuffled[i + 1], `Married ${shuffled[i].name}`);
  }
}

function checkDivorce(couple) {
  const compatibility = traitsList.reduce((acc, trait) => {
    const diff = Math.abs(couple[0].traits[trait] - couple[1].traits[trait]);
    return acc + (1 - diff); // closer traits = higher compatibility
  }, 0);

  const divorceChance = Math.random();
  return divorceChance > (compatibility / traitsList.length); // less compatibility = higher risk
}

function processDivorces(people) {
  people.forEach(person => {
    const partner = person.spouse;
    if (partner && checkDivorce([person, partner])) {
      addEvent(person, `Divorced ${partner.name}`);
      addEvent(partner, `Divorced ${person.name}`);
      person.spouse = null;
      partner.spouse = null;
    }
  });
}

function generateChildren(couple, generation, count = 2) {
  const children = [];
  for (let i = 0; i < count; i++) {
    const traits = {};
    traitsList.forEach(trait => {
      const avgTrait = (couple[0].traits[trait] + couple[1].traits[trait]) / 2;
      traits[trait] = avgTrait + (Math.random() - 0.5) * 0.2;
    });

    const child = createPerson(`${couple[0].name}&${couple[1].name}-kid${i + 1}`, generation, traits);
    children.push(child);
    couple[0].children.push(child);
    couple[1].children.push(child);
  }
  return children;
}

function createFamilyTree(rootName, generations = 3) {
  const allPeople = [];
  const firstGen = [createPerson(rootName, 0)];
  allPeople.push(...firstGen);

  for (let gen = 0; gen < generations; gen++) {
    const currentGen = allPeople.filter(p => p.generation === gen);
    marryPeople(currentGen);

    currentGen.forEach(person => {
      if (person.spouse && person.children.length === 0) {
        const kids = generateChildren([person, person.spouse], gen + 1, Math.floor(Math.random() * 3 + 1));
        allPeople.push(...kids);
      }
    });
    processDivorces(currentGen);
  }

  return firstGen[0];
}

function narrateStory(person) {
  const lines = [];
  lines.push(`${person.name} was born in generation ${person.generation}, destined to be a ${person.personality}.`);

  const strongTrait = Object.entries(person.traits)
    .sort((a, b) => b[1] - a[1])[0][0];

  lines.push(`${person.name} showed remarkable ${strongTrait} growing up.`);

  if (person.spouse) {
    lines.push(`They eventually fell in love and married ${person.spouse.name}.`);
  }

  person.events.forEach(evt => {
    if (!evt.description.startsWith('Born')) {
      lines.push(`Around ${evt.timestamp.split('T')[0]}, ${evt.description.toLowerCase()}.`);
    }
  });

  if (person.children.length) {
    lines.push(`${person.name} raised ${person.children.length} child${person.children.length > 1 ? 'ren' : ''}, continuing the family legacy.`);
  }

  return lines.join(' ');
}

// Example usage:
const person = createFamilyTree("Alex", 3);

// Render life events in the DOM
div.innerHTML += `
  <br><em>Life Events:</em><ul>
    ${person.events.map(e => `<li>${e.timestamp.split('T')[0]}: ${e.description}</li>`).join('')}
  </ul>
`;

// Add story button
const storyButton = document.createElement('button');
storyButton.textContent = 'Read Life Story';
storyButton.onclick = () => alert(narrateStory(person));
div.appendChild(storyButton);