const baseClass = {
  swordman: '',
  archer: '',
};

const swordman = {
  pathOne: [],
  pathTwo: [],
};

const archer = {
  pathOne: [],
  pathTwo: [],
};

interface Skill {
  name: string;
  maxLevel: number;
  currentLevel: number;
  skillDescription: string[];
}

type Job = Skill[][];

const baseArcher: Job = [
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
];

const hunter: Job = [
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
];

const sniper: Job = [
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 5, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 0, skillDescription: [] },
  ],
  [
    { name: 'skill1', currentLevel: 0, maxLevel: 10, skillDescription: [] },
    { name: 'skill2', currentLevel: 0, maxLevel: 5, skillDescription: [] },
    { name: 'skill3', currentLevel: 0, maxLevel: 0, skillDescription: [] },
    { name: 'skill4', currentLevel: 0, maxLevel: 5, skillDescription: [] },
    { name: 'skill5', currentLevel: 0, maxLevel: 10, skillDescription: [] },
  ],
];
