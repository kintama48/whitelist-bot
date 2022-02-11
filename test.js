// const args = ("!whitelist <@user>".substring("!whitelist".length).split(/ |\n/)).filter(n=>n)
const args = "<@!21313>".split(/<@!|>/).filter(n=>n)
console.log(args)