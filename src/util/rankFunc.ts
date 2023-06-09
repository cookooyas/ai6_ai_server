export function earnXP(rank): number {
  switch (rank) {
    case 'SSS':
      return 100;
    case 'S':
      return 50;
    case 'A':
      return 30;
    case 'B':
      return 15;
    case 'C':
      return 10;
    case 'D':
      return 5;
    default:
      return 0;
  }
}

export function theRank(score): 'SSS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  return score >= 95
    ? 'SSS'
    : score >= 90
    ? 'S'
    : score >= 80
    ? 'A'
    : score >= 70
    ? 'B'
    : score >= 60
    ? 'C'
    : score >= 40
    ? 'D'
    : 'F';
}
