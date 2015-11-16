'use strict';

// Array Remove - By John Resig (MIT Licensed)
const removeFromArray = (arr, from, to) => {
  var rest = arr.slice((to || from) + 1 || arr.length);
  arr.length = from < 0 ? arr.length + from : from;
  return arr.push.apply(arr, rest);
};

const mapRange = (value, low1, high1, low2, high2) => {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

const distanceBetweenPoints = (pos1, pos2) => {
  return Math.sqrt(( Math.pow(pos2.x-pos1.x, 2) + Math.pow(pos2.y-pos1.y, 2) + Math.pow(pos2.z-pos1.z, 2)), 2);
};

const toRadians = angle => {
  return angle * (Math.PI / 180);
};

module.exports = {
	removeFromArray,
	mapRange,
  distanceBetweenPoints,
  toRadians
}

