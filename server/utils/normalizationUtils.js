const normalizeBranch = (val) => {
  const s = String(val || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  if (s === 'it' || s === 'informationtechnology' || s === 'infotech' || s === 'informationtech') {
    return 'Information Technology';
  }
  if (s === 'cs' || s === 'cse' || s === 'comps' || s === 'computerscience') {
    return 'Computer Science';
  }
  if (s === 'ce' || s === 'computerengineering') {
    return 'Computer Engineering';
  }
  if (s === 'electronics' || s === 'extc' || s === 'ece' || s === 'entc') {
    return 'Electronics';
  }
  if (s === 'mechanical' || s === 'mech' || s === 'me' || s === 'mechanicalengineering') {
    return 'Mechanical Engineering';
  }
  if (s === 'civil') {
    return 'Civil';
  }
  return val;
};

const normalizeYear = (val) => {
  const s = String(val || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s === 'fe' || s === 'fy' || s === 'firstyear' || s === '1styear' || s === '1st') {
    return 'First Year';
  }
  if (s === 'se' || s === 'sy' || s === 'secondyear' || s === '2ndyear' || s === '2nd') {
    return 'Second Year';
  }
  if (s === 'te' || s === 'ty' || s === 'thirdyear' || s === '3rdyear' || s === '3rd') {
    return 'Third Year';
  }
  if (s === 'be' || s === 'fourthyear' || s === '4thyear' || s === '4th' || s === 'finalyear') {
    return 'Fourth Year';
  }
  return val;
};

module.exports = { normalizeBranch, normalizeYear };
