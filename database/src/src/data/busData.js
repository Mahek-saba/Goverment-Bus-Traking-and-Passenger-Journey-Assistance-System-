/**
 * Temporary Demo Bus Data
 * 
 * NOTE: This is sample/mock government transit bus data for initial development
 * and testing. It does not represent actual live transit authority data.
 * This file will be replaced with MongoDB database queries in later stages.
 */

const demoBuses = [
  {
    id: 'BUS-101',
    busNumber: 'MH-12-RN-1001',
    busType: 'Ordinary Express',
    source: 'Solapur',
    destination: 'Pune',
    departureTime: '06:00 AM',
    arrivalTime: '11:00 AM',
    fare: 350,
    availableSeats: 28
  },
  {
    id: 'BUS-102',
    busNumber: 'MH-12-RN-1002',
    busType: 'Semi-Luxury (Hirkani)',
    source: 'Solapur',
    destination: 'Pune',
    departureTime: '09:30 AM',
    arrivalTime: '02:30 PM',
    fare: 420,
    availableSeats: 15
  },
  {
    id: 'BUS-103',
    busNumber: 'MH-12-RN-1003',
    busType: 'Shivshahi (AC)',
    source: 'Solapur',
    destination: 'Pune',
    departureTime: '02:00 PM',
    arrivalTime: '07:00 PM',
    fare: 550,
    availableSeats: 22
  },
  {
    id: 'BUS-104',
    busNumber: 'MH-14-BT-2001',
    busType: 'Ordinary Express',
    source: 'Pune',
    destination: 'Solapur',
    departureTime: '07:00 AM',
    arrivalTime: '12:00 PM',
    fare: 350,
    availableSeats: 30
  },
  {
    id: 'BUS-105',
    busNumber: 'MH-14-BT-2002',
    busType: 'Shivshahi (AC)',
    source: 'Pune',
    destination: 'Solapur',
    departureTime: '03:30 PM',
    arrivalTime: '08:30 PM',
    fare: 550,
    availableSeats: 18
  },
  {
    id: 'BUS-106',
    busNumber: 'MH-20-EQ-3001',
    busType: 'Ordinary Express',
    source: 'Pune',
    destination: 'Mumbai',
    departureTime: '08:00 AM',
    arrivalTime: '12:00 PM',
    fare: 280,
    availableSeats: 35
  },
  {
    id: 'BUS-107',
    busNumber: 'MH-13-CW-4001',
    busType: 'Ordinary Express',
    source: 'Solapur',
    destination: 'Kolhapur',
    departureTime: '06:30 AM',
    arrivalTime: '12:00 PM',
    fare: 320,
    availableSeats: 20
  }
];

module.exports = demoBuses;

