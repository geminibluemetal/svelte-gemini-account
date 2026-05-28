export function runCalculateRule(name, category, attendanceData) {
  try {
    const calculatedData = {}
    const segementData = {}
    let listOfOptimaizedRule = sortRulesByDependency(category.calculationRule)

    let segement = listOfOptimaizedRule.map(r => {
      return r.rule
        .split(/[+\-*/]+/) // Splits by any of these operators
        .filter(item => item.trim() !== ""); // Removes empty chunks if any
    });
    segement = segement.flat().sort()

    segement.forEach(s => {
      if (s.startsWith("SUM:")) {
        const path = s.replace("SUM:", "")
        const totalSum = attendanceData.reduce((sum, ad) => {
          const value = ad.fields && ad.fields[path] ? Number(ad.fields[path]) : 0;
          return sum + value;
        }, 0);
        segementData[`SUM:${path}`] = totalSum
      } else if (s.startsWith("nd:")) {
        const path = s.replace("nd:", "")
        segementData[`nd:${path}`] = name[path]
      } else if (s.startsWith("fd:")) {
        const path = s.replace("fd:", "")
        const field = category.fields.find(f => f.shortName == path)
        segementData[`fd:${path}`] = field.amount
      }
    })

    listOfOptimaizedRule.map(r => {
      const segement = r.rule.match(/[a-zA-Z0-9_:]+|[+\-*/]/g);
      const result = segement.map(s => {
        if (s == '+' || s == '-' || s == '*' || s == '/') return s
        else if (s.startsWith('cl:')) {
          const dataKey = s.replace("cl:", '')
          return calculatedData[dataKey]
        } else {
          return segementData[s]
        }
      })
      calculatedData[r.key] = eval(result.join(""))
    })

    return calculatedData
  } catch (error) {
    console.warn("Error Occured in Evaluating Calculation Rule")
    console.error(error)
  }
}

function sortRulesByDependency(rules) {
  const sorted = [];
  const visited = new Set();
  const tempVisited = new Set(); // To detect circular dependencies

  // Create a map for quick rule lookups by key
  const ruleMap = new Map(rules.map(r => [r.key, r]));

  // Helper function to extract dependencies (e.g., "cl:tipLoads" -> "tipLoads")
  function getDependencies(ruleStr) {
    const segments = ruleStr.split(/[+\-*/]+/);
    const deps = [];
    for (let seg of segments) {
      if (seg.startsWith("cl:")) {
        deps.push(seg.replace("cl:", ""));
      }
    }
    return deps;
  }

  function visit(key) {
    if (visited.has(key)) return;
    if (tempVisited.has(key)) {
      throw new Error(`Circular dependency detected at: ${key}`);
    }

    const rule = ruleMap.get(key);
    // If the dependency isn't in our rule list (like an external variable 'cl:mayilAmount'), 
    // we assume it's already provided externally.
    if (!rule) return;

    tempVisited.add(key);

    // Visit all dependencies of this rule first
    const dependencies = getDependencies(rule.rule);
    for (let dep of dependencies) {
      visit(dep);
    }

    tempVisited.delete(key);
    visited.add(key);
    sorted.push(rule);
  }

  // Run the topological sort for every rule
  for (let rule of rules) {
    visit(rule.key);
  }

  return sorted;
}