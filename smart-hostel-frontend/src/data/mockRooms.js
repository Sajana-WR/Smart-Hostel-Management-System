// src/data/mockRooms.js

const mockRooms = [
  {
    id: "A-101",
    block: "A",
    floor: 1,
    type: "Triple",
    capacity: 3,
    occupied: 3,
    status: "Full",
  },
  {
    id: "A-103",
    block: "A",
    floor: 1,
    type: "Double",
    capacity: 2,
    occupied: 1,
    status: "Available",
  },
  {
    id: "B-204",
    block: "B",
    floor: 2,
    type: "Quad",
    capacity: 4,
    occupied: 3,
    status: "Almost Full",
  },
  {
    id: "C-301",
    block: "C",
    floor: 3,
    type: "Single",
    capacity: 1,
    occupied: 0,
    status: "Available",
  },
];

export default mockRooms;
