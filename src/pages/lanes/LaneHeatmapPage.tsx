import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'
import MapView, { type RouteWaypoint } from '../../components/MapView'

// ─── Types ────────────────────────────────────────────────────────────────────
type HeatMetric = 'rpm' | 'profit' | 'volume'

interface Lane {
  from: string
  to: string
  fromCity: string
  toCity: string
  miles: number
  avgRate: number
  avgRPM: number
  volume: number
  trend: 'up' | 'down' | 'flat'
  commodity: string
}

interface StateData {
  id: string
  name: string
  avgRPM: number      // $/mile avg outbound
  avgProfit: number   // $ avg per trip
  volume: number      // trips last 90 days
  lanes: Lane[]
  seasonal: number[]  // 12-month RPM index (1.0 = average)
}

// ─── Mock State Data ──────────────────────────────────────────────────────────
const STATE_DATA: Record<string, StateData> = {
  AL: { id:'AL', name:'Alabama',       avgRPM:2.21, avgProfit:1820, volume:142,
    seasonal:[.88,.90,.95,1.0,1.05,1.0,.96,.98,1.02,1.08,1.03,.92],
    lanes:[
      {from:'AL',to:'GA',fromCity:'Birmingham',toCity:'Atlanta',miles:150,avgRate:420,avgRPM:2.80,volume:38,trend:'up',commodity:'Auto Parts'},
      {from:'AL',to:'TN',fromCity:'Huntsville',toCity:'Nashville',miles:120,avgRate:310,avgRPM:2.58,volume:24,trend:'flat',commodity:'Steel'},
      {from:'AL',to:'TX',fromCity:'Mobile',toCity:'Houston',miles:480,avgRate:1050,avgRPM:2.19,volume:18,trend:'down',commodity:'Chemicals'},
      {from:'FL',to:'AL',fromCity:'Pensacola',toCity:'Montgomery',miles:200,avgRate:510,avgRPM:2.55,volume:22,trend:'up',commodity:'Produce'},
      {from:'TN',to:'AL',fromCity:'Chattanooga',toCity:'Birmingham',miles:140,avgRate:360,avgRPM:2.57,volume:16,trend:'flat',commodity:'Manufactured Goods'},
    ]},
  AK: { id:'AK', name:'Alaska',        avgRPM:3.85, avgProfit:5200, volume:8,
    seasonal:[.70,.72,.85,.95,1.10,1.15,1.20,1.20,1.10,.95,.80,.72],
    lanes:[
      {from:'AK',to:'WA',fromCity:'Anchorage',toCity:'Seattle',miles:1400,avgRate:5800,avgRPM:4.14,volume:5,trend:'flat',commodity:'Seafood/Reefer'},
      {from:'AK',to:'AK',fromCity:'Fairbanks',toCity:'Anchorage',miles:360,avgRate:1200,avgRPM:3.33,volume:3,trend:'up',commodity:'General Freight'},
    ]},
  AZ: { id:'AZ', name:'Arizona',       avgRPM:2.33, avgProfit:2100, volume:218,
    seasonal:[1.05,1.08,1.10,1.05,.95,.88,.82,.85,.92,1.0,1.05,1.08],
    lanes:[
      {from:'AZ',to:'CA',fromCity:'Phoenix',toCity:'Los Angeles',miles:370,avgRate:980,avgRPM:2.65,volume:62,trend:'up',commodity:'Produce'},
      {from:'AZ',to:'TX',fromCity:'Tucson',toCity:'Dallas',miles:890,avgRate:2050,avgRPM:2.30,volume:38,trend:'flat',commodity:'Electronics'},
      {from:'CA',to:'AZ',fromCity:'Los Angeles',toCity:'Phoenix',miles:370,avgRate:810,avgRPM:2.19,volume:45,trend:'down',commodity:'General Freight'},
      {from:'AZ',to:'CO',fromCity:'Phoenix',toCity:'Denver',miles:600,avgRate:1560,avgRPM:2.60,volume:28,trend:'up',commodity:'Dry Van'},
      {from:'NV',to:'AZ',fromCity:'Las Vegas',toCity:'Phoenix',miles:290,avgRate:720,avgRPM:2.48,volume:22,trend:'flat',commodity:'Consumer Goods'},
    ]},
  AR: { id:'AR', name:'Arkansas',      avgRPM:2.18, avgProfit:1750, volume:168,
    seasonal:[.90,.92,.98,1.05,1.08,1.02,.95,.95,1.0,1.05,1.0,.92],
    lanes:[
      {from:'AR',to:'TN',fromCity:'Memphis AR',toCity:'Nashville',miles:320,avgRate:780,avgRPM:2.44,volume:42,trend:'up',commodity:'Retail'},
      {from:'AR',to:'TX',fromCity:'Little Rock',toCity:'Dallas',miles:310,avgRate:680,avgRPM:2.19,volume:38,trend:'flat',commodity:'Agricultural'},
      {from:'MO',to:'AR',fromCity:'Springfield',toCity:'Fort Smith',miles:180,avgRate:400,avgRPM:2.22,volume:32,trend:'down',commodity:'Manufactured Goods'},
      {from:'AR',to:'GA',fromCity:'Little Rock',toCity:'Atlanta',miles:580,avgRate:1280,avgRPM:2.21,volume:18,trend:'up',commodity:'Food Grade'},
    ]},
  CA: { id:'CA', name:'California',    avgRPM:2.48, avgProfit:3200, volume:485,
    seasonal:[.95,.98,1.0,1.05,1.08,1.05,1.0,.98,1.02,1.05,1.0,.95],
    lanes:[
      {from:'CA',to:'AZ',fromCity:'Los Angeles',toCity:'Phoenix',miles:370,avgRate:920,avgRPM:2.49,volume:95,trend:'up',commodity:'Consumer Electronics'},
      {from:'CA',to:'NV',fromCity:'Los Angeles',toCity:'Las Vegas',miles:270,avgRate:720,avgRPM:2.67,volume:72,trend:'flat',commodity:'Retail/General'},
      {from:'CA',to:'OR',fromCity:'Sacramento',toCity:'Portland',miles:580,avgRate:1580,avgRPM:2.72,volume:55,trend:'up',commodity:'Produce/Reefer'},
      {from:'CA',to:'TX',fromCity:'Los Angeles',toCity:'Dallas',miles:1420,avgRate:3200,avgRPM:2.25,volume:40,trend:'down',commodity:'Auto Parts'},
      {from:'CA',to:'WA',fromCity:'Fresno',toCity:'Seattle',miles:830,avgRate:2100,avgRPM:2.53,volume:35,trend:'up',commodity:'Produce'},
      {from:'TX',to:'CA',fromCity:'Houston',toCity:'Los Angeles',miles:1540,avgRate:3280,avgRPM:2.13,volume:28,trend:'flat',commodity:'Chemicals'},
    ]},
  CO: { id:'CO', name:'Colorado',      avgRPM:2.56, avgProfit:2850, volume:192,
    seasonal:[.88,.90,.95,1.02,1.08,1.05,1.0,1.02,1.05,1.05,1.0,.90],
    lanes:[
      {from:'CO',to:'TX',fromCity:'Denver',toCity:'Dallas',miles:870,avgRate:2280,avgRPM:2.62,volume:48,trend:'up',commodity:'Tech/Electronics'},
      {from:'CO',to:'CA',fromCity:'Denver',toCity:'Los Angeles',miles:1050,avgRate:2800,avgRPM:2.67,volume:35,trend:'up',commodity:'Produce/Reefer'},
      {from:'CO',to:'IL',fromCity:'Denver',toCity:'Chicago',miles:900,avgRate:2250,avgRPM:2.50,volume:32,trend:'flat',commodity:'Agricultural'},
      {from:'TX',to:'CO',fromCity:'Dallas',toCity:'Denver',miles:870,avgRate:2100,avgRPM:2.41,volume:28,trend:'down',commodity:'General Freight'},
      {from:'CO',to:'KS',fromCity:'Pueblo',toCity:'Wichita',miles:280,avgRate:720,avgRPM:2.57,volume:22,trend:'flat',commodity:'Agricultural'},
    ]},
  CT: { id:'CT', name:'Connecticut',   avgRPM:2.92, avgProfit:2200, volume:95,
    seasonal:[.92,.95,.98,1.02,1.05,1.02,.98,.96,1.0,1.05,1.03,.93],
    lanes:[
      {from:'CT',to:'NY',fromCity:'Hartford',toCity:'New York',miles:120,avgRate:380,avgRPM:3.17,volume:28,trend:'up',commodity:'High-Value Freight'},
      {from:'CT',to:'NJ',fromCity:'Bridgeport',toCity:'Newark',miles:90,avgRate:295,avgRPM:3.28,volume:22,trend:'up',commodity:'Pharmaceuticals'},
      {from:'MA',to:'CT',fromCity:'Springfield',toCity:'Hartford',miles:65,avgRate:205,avgRPM:3.15,volume:18,trend:'flat',commodity:'Medical Devices'},
      {from:'CT',to:'PA',fromCity:'New Haven',toCity:'Philadelphia',miles:130,avgRate:395,avgRPM:3.04,volume:15,trend:'up',commodity:'General Freight'},
    ]},
  DE: { id:'DE', name:'Delaware',      avgRPM:2.85, avgProfit:1950, volume:52,
    seasonal:[.93,.95,.98,1.02,1.04,1.02,.98,.96,1.0,1.04,1.02,.93],
    lanes:[
      {from:'DE',to:'NJ',fromCity:'Wilmington',toCity:'Newark',miles:40,avgRate:130,avgRPM:3.25,volume:18,trend:'up',commodity:'Chemicals'},
      {from:'DE',to:'PA',fromCity:'Dover',toCity:'Philadelphia',miles:70,avgRate:215,avgRPM:3.07,volume:15,trend:'flat',commodity:'General Freight'},
      {from:'MD',to:'DE',fromCity:'Baltimore',toCity:'Wilmington',miles:65,avgRate:195,avgRPM:3.00,volume:12,trend:'up',commodity:'Chemicals'},
    ]},
  FL: { id:'FL', name:'Florida',       avgRPM:2.45, avgProfit:2600, volume:348,
    seasonal:[1.08,1.10,1.05,1.0,.95,.90,.88,.90,.95,1.0,1.05,1.10],
    lanes:[
      {from:'FL',to:'GA',fromCity:'Jacksonville',toCity:'Atlanta',miles:345,avgRate:950,avgRPM:2.75,volume:82,trend:'up',commodity:'Produce/Reefer'},
      {from:'FL',to:'NC',fromCity:'Miami',toCity:'Charlotte',miles:680,avgRate:1780,avgRPM:2.62,volume:55,trend:'up',commodity:'Citrus/Produce'},
      {from:'FL',to:'TX',fromCity:'Tampa',toCity:'Houston',miles:980,avgRate:2350,avgRPM:2.40,volume:38,trend:'flat',commodity:'General Freight'},
      {from:'GA',to:'FL',fromCity:'Atlanta',toCity:'Miami',miles:660,avgRate:1520,avgRPM:2.30,volume:42,trend:'down',commodity:'Retail'},
      {from:'FL',to:'NY',fromCity:'Orlando',toCity:'New York',miles:1080,avgRate:2750,avgRPM:2.55,volume:28,trend:'up',commodity:'Produce'},
    ]},
  GA: { id:'GA', name:'Georgia',       avgRPM:2.35, avgProfit:2150, volume:285,
    seasonal:[.94,.96,1.0,1.04,1.06,1.02,.98,.98,1.02,1.06,1.02,.93],
    lanes:[
      {from:'GA',to:'FL',fromCity:'Atlanta',toCity:'Jacksonville',miles:340,avgRate:880,avgRPM:2.59,volume:68,trend:'up',commodity:'Auto Parts'},
      {from:'GA',to:'TN',fromCity:'Atlanta',toCity:'Nashville',miles:250,avgRate:640,avgRPM:2.56,volume:52,trend:'flat',commodity:'Automotive'},
      {from:'GA',to:'NC',fromCity:'Atlanta',toCity:'Charlotte',miles:245,avgRate:600,avgRPM:2.45,volume:45,trend:'up',commodity:'Retail'},
      {from:'GA',to:'TX',fromCity:'Savannah',toCity:'Dallas',miles:820,avgRate:1850,avgRPM:2.26,volume:28,trend:'down',commodity:'Containers/Intermodal'},
    ]},
  HI: { id:'HI', name:'Hawaii',        avgRPM:3.20, avgProfit:4100, volume:12,
    seasonal:[1.08,1.05,1.0,.98,1.02,1.05,1.08,1.10,1.05,1.0,.98,1.05],
    lanes:[
      {from:'HI',to:'CA',fromCity:'Honolulu',toCity:'Los Angeles',miles:2560,avgRate:8200,avgRPM:3.20,volume:8,trend:'flat',commodity:'Interisland/General'},
    ]},
  ID: { id:'ID', name:'Idaho',         avgRPM:2.28, avgProfit:2050, volume:88,
    seasonal:[.85,.88,.95,1.05,1.10,1.08,1.02,1.02,1.05,1.02,.92,.85],
    lanes:[
      {from:'ID',to:'WA',fromCity:'Boise',toCity:'Spokane',miles:310,avgRate:800,avgRPM:2.58,volume:25,trend:'up',commodity:'Agricultural'},
      {from:'ID',to:'UT',fromCity:'Pocatello',toCity:'Salt Lake City',miles:170,avgRate:420,avgRPM:2.47,volume:22,trend:'flat',commodity:'Lumber'},
      {from:'ID',to:'OR',fromCity:'Boise',toCity:'Portland',miles:430,avgRate:1050,avgRPM:2.44,volume:18,trend:'up',commodity:'Produce'},
    ]},
  IL: { id:'IL', name:'Illinois',      avgRPM:2.12, avgProfit:1680, volume:510,
    seasonal:[.88,.90,.95,1.02,1.06,1.04,1.0,.98,1.04,1.06,1.02,.90],
    lanes:[
      {from:'IL',to:'TX',fromCity:'Chicago',toCity:'Dallas',miles:920,avgRate:2100,avgRPM:2.28,volume:115,trend:'flat',commodity:'General Freight'},
      {from:'IL',to:'OH',fromCity:'Chicago',toCity:'Columbus',miles:360,avgRate:820,avgRPM:2.28,volume:88,trend:'up',commodity:'Manufacturing'},
      {from:'IL',to:'GA',fromCity:'Chicago',toCity:'Atlanta',miles:720,avgRate:1620,avgRPM:2.25,volume:65,trend:'up',commodity:'Retail/CPG'},
      {from:'IL',to:'CA',fromCity:'Chicago',toCity:'Los Angeles',miles:2020,avgRate:4280,avgRPM:2.12,volume:42,trend:'down',commodity:'Dry Van'},
      {from:'TX',to:'IL',fromCity:'Dallas',toCity:'Chicago',miles:920,avgRate:1950,avgRPM:2.12,volume:55,trend:'flat',commodity:'General Freight'},
    ]},
  IN: { id:'IN', name:'Indiana',       avgRPM:2.14, avgProfit:1620, volume:298,
    seasonal:[.89,.91,.96,1.03,1.06,1.03,1.0,.98,1.03,1.05,1.0,.90],
    lanes:[
      {from:'IN',to:'OH',fromCity:'Indianapolis',toCity:'Columbus',miles:180,avgRate:440,avgRPM:2.44,volume:72,trend:'up',commodity:'Automotive'},
      {from:'IN',to:'IL',fromCity:'Indianapolis',toCity:'Chicago',miles:180,avgRate:415,avgRPM:2.31,volume:65,trend:'flat',commodity:'Manufacturing'},
      {from:'IN',to:'TN',fromCity:'Indianapolis',toCity:'Nashville',miles:280,avgRate:640,avgRPM:2.29,volume:42,trend:'up',commodity:'Auto Parts'},
    ]},
  IA: { id:'IA', name:'Iowa',          avgRPM:2.22, avgProfit:1980, volume:178,
    seasonal:[.87,.89,.95,1.05,1.10,1.06,1.0,.98,1.04,1.06,1.0,.88],
    lanes:[
      {from:'IA',to:'IL',fromCity:'Des Moines',toCity:'Chicago',miles:310,avgRate:750,avgRPM:2.42,volume:48,trend:'up',commodity:'Agricultural'},
      {from:'IA',to:'MN',fromCity:'Des Moines',toCity:'Minneapolis',miles:240,avgRate:580,avgRPM:2.42,volume:38,trend:'flat',commodity:'Feed/Grain'},
      {from:'IA',to:'TX',fromCity:'Iowa City',toCity:'Dallas',miles:870,avgRate:1950,avgRPM:2.24,volume:28,trend:'down',commodity:'Hogs/Livestock'},
    ]},
  KS: { id:'KS', name:'Kansas',        avgRPM:2.20, avgProfit:2100, volume:155,
    seasonal:[.88,.90,.96,1.04,1.10,1.06,.98,.97,1.02,1.05,1.0,.90],
    lanes:[
      {from:'KS',to:'TX',fromCity:'Wichita',toCity:'Dallas',miles:380,avgRate:870,avgRPM:2.29,volume:42,trend:'flat',commodity:'Agricultural/Grain'},
      {from:'KS',to:'CO',fromCity:'Kansas City',toCity:'Denver',miles:600,avgRate:1450,avgRPM:2.42,volume:32,trend:'up',commodity:'Consumer Goods'},
      {from:'KS',to:'IL',fromCity:'Kansas City',toCity:'Chicago',miles:510,avgRate:1140,avgRPM:2.24,volume:28,trend:'flat',commodity:'Livestock'},
    ]},
  KY: { id:'KY', name:'Kentucky',      avgRPM:2.26, avgProfit:1780, volume:224,
    seasonal:[.90,.92,.97,1.03,1.06,1.02,.98,.97,1.02,1.06,1.02,.92],
    lanes:[
      {from:'KY',to:'OH',fromCity:'Louisville',toCity:'Columbus',miles:180,avgRate:440,avgRPM:2.44,volume:58,trend:'up',commodity:'Auto Parts (Toyota/Ford)'},
      {from:'KY',to:'TN',fromCity:'Lexington',toCity:'Nashville',miles:180,avgRate:430,avgRPM:2.39,volume:45,trend:'flat',commodity:'Manufacturing'},
      {from:'KY',to:'GA',fromCity:'Louisville',toCity:'Atlanta',miles:460,avgRate:1080,avgRPM:2.35,volume:35,trend:'up',commodity:'Automotive'},
    ]},
  LA: { id:'LA', name:'Louisiana',     avgRPM:2.30, avgProfit:2250, volume:185,
    seasonal:[.92,.94,.98,1.02,1.04,1.0,.96,.96,1.0,1.04,1.02,.94],
    lanes:[
      {from:'LA',to:'TX',fromCity:'New Orleans',toCity:'Houston',miles:350,avgRate:850,avgRPM:2.43,volume:55,trend:'flat',commodity:'Petrochemicals'},
      {from:'LA',to:'GA',fromCity:'Baton Rouge',toCity:'Atlanta',miles:470,avgRate:1100,avgRPM:2.34,volume:38,trend:'up',commodity:'Manufactured Goods'},
      {from:'TX',to:'LA',fromCity:'Houston',toCity:'New Orleans',miles:350,avgRate:790,avgRPM:2.26,volume:32,trend:'down',commodity:'Industrial Goods'},
    ]},
  ME: { id:'ME', name:'Maine',         avgRPM:2.82, avgProfit:2350, volume:62,
    seasonal:[.80,.82,.90,.98,1.05,1.08,1.12,1.12,1.05,.98,.90,.80],
    lanes:[
      {from:'ME',to:'MA',fromCity:'Portland',toCity:'Boston',miles:110,avgRate:330,avgRPM:3.00,volume:22,trend:'up',commodity:'Seafood/Reefer'},
      {from:'ME',to:'NY',fromCity:'Bangor',toCity:'New York',miles:320,avgRate:940,avgRPM:2.94,volume:18,trend:'up',commodity:'General Freight'},
      {from:'MA',to:'ME',fromCity:'Boston',toCity:'Augusta',miles:160,avgRate:460,avgRPM:2.88,volume:12,trend:'flat',commodity:'Retail/Consumer'},
    ]},
  MD: { id:'MD', name:'Maryland',      avgRPM:2.78, avgProfit:2150, volume:145,
    seasonal:[.92,.94,.98,1.02,1.05,1.02,.98,.97,1.02,1.05,1.03,.93],
    lanes:[
      {from:'MD',to:'NY',fromCity:'Baltimore',toCity:'New York',miles:200,avgRate:580,avgRPM:2.90,volume:42,trend:'up',commodity:'General/LTL'},
      {from:'MD',to:'VA',fromCity:'Baltimore',toCity:'Richmond',miles:110,avgRate:320,avgRPM:2.91,volume:32,trend:'flat',commodity:'Government Freight'},
      {from:'MD',to:'PA',fromCity:'Frederick',toCity:'Philadelphia',miles:115,avgRate:330,avgRPM:2.87,volume:28,trend:'up',commodity:'Pharma/Healthcare'},
    ]},
  MA: { id:'MA', name:'Massachusetts', avgRPM:2.88, avgProfit:2450, volume:168,
    seasonal:[.90,.92,.97,1.02,1.05,1.02,.98,.97,1.02,1.06,1.04,.92],
    lanes:[
      {from:'MA',to:'NY',fromCity:'Boston',toCity:'New York',miles:215,avgRate:645,avgRPM:3.00,volume:52,trend:'up',commodity:'High-Value/Pharma'},
      {from:'MA',to:'CT',fromCity:'Worcester',toCity:'Hartford',miles:70,avgRate:215,avgRPM:3.07,volume:35,trend:'flat',commodity:'Medical Devices'},
      {from:'MA',to:'NJ',fromCity:'Springfield',toCity:'Newark',miles:180,avgRate:535,avgRPM:2.97,volume:28,trend:'up',commodity:'Technology'},
    ]},
  MI: { id:'MI', name:'Michigan',      avgRPM:2.18, avgProfit:1820, volume:265,
    seasonal:[.85,.88,.94,1.02,1.08,1.06,1.02,1.0,1.04,1.06,1.0,.87],
    lanes:[
      {from:'MI',to:'OH',fromCity:'Detroit',toCity:'Columbus',miles:175,avgRate:420,avgRPM:2.40,volume:72,trend:'up',commodity:'Automotive Parts'},
      {from:'MI',to:'IL',fromCity:'Grand Rapids',toCity:'Chicago',miles:165,avgRate:390,avgRPM:2.36,volume:58,trend:'flat',commodity:'Manufacturing'},
      {from:'MI',to:'IN',fromCity:'Detroit',toCity:'Indianapolis',miles:285,avgRate:660,avgRPM:2.32,volume:42,trend:'up',commodity:'Auto Components'},
    ]},
  MN: { id:'MN', name:'Minnesota',     avgRPM:2.32, avgProfit:2280, volume:198,
    seasonal:[.80,.82,.90,1.02,1.10,1.08,1.04,1.02,1.06,1.06,.95,.82],
    lanes:[
      {from:'MN',to:'IL',fromCity:'Minneapolis',toCity:'Chicago',miles:410,avgRate:1000,avgRPM:2.44,volume:55,trend:'up',commodity:'Grain/Agricultural'},
      {from:'MN',to:'TX',fromCity:'Minneapolis',toCity:'Dallas',miles:1140,avgRate:2600,avgRPM:2.28,volume:35,trend:'flat',commodity:'Industrial'},
      {from:'MN',to:'WI',fromCity:'Duluth',toCity:'Milwaukee',miles:290,avgRate:670,avgRPM:2.31,volume:28,trend:'up',commodity:'Paper/Lumber'},
    ]},
  MS: { id:'MS', name:'Mississippi',   avgRPM:2.16, avgProfit:1720, volume:138,
    seasonal:[.88,.90,.95,1.02,1.06,1.02,.96,.96,1.0,1.06,1.02,.90],
    lanes:[
      {from:'MS',to:'TN',fromCity:'Jackson',toCity:'Memphis',miles:210,avgRate:480,avgRPM:2.29,volume:38,trend:'up',commodity:'Poultry/Food'},
      {from:'MS',to:'GA',fromCity:'Hattiesburg',toCity:'Atlanta',miles:440,avgRate:980,avgRPM:2.23,volume:28,trend:'flat',commodity:'Retail'},
      {from:'LA',to:'MS',fromCity:'New Orleans',toCity:'Gulfport',miles:90,avgRate:215,avgRPM:2.39,volume:25,trend:'down',commodity:'General Freight'},
    ]},
  MO: { id:'MO', name:'Missouri',      avgRPM:2.20, avgProfit:1980, volume:248,
    seasonal:[.88,.90,.95,1.02,1.06,1.03,.98,.97,1.02,1.06,1.02,.90],
    lanes:[
      {from:'MO',to:'TX',fromCity:'Kansas City',toCity:'Dallas',miles:490,avgRate:1120,avgRPM:2.29,volume:65,trend:'flat',commodity:'General Freight'},
      {from:'MO',to:'IL',fromCity:'St. Louis',toCity:'Chicago',miles:300,avgRate:680,avgRPM:2.27,volume:52,trend:'up',commodity:'Automotive/Mfg'},
      {from:'MO',to:'TN',fromCity:'Springfield',toCity:'Nashville',miles:290,avgRate:660,avgRPM:2.28,volume:38,trend:'up',commodity:'Retail CPG'},
    ]},
  MT: { id:'MT', name:'Montana',       avgRPM:2.42, avgProfit:2650, volume:72,
    seasonal:[.80,.82,.88,.98,1.08,1.10,1.08,1.06,1.05,1.02,.92,.80],
    lanes:[
      {from:'MT',to:'WA',fromCity:'Billings',toCity:'Spokane',miles:320,avgRate:820,avgRPM:2.56,volume:22,trend:'up',commodity:'Agricultural/Grain'},
      {from:'MT',to:'ID',fromCity:'Missoula',toCity:'Boise',miles:400,avgRate:1020,avgRPM:2.55,volume:18,trend:'flat',commodity:'Lumber'},
      {from:'MT',to:'ND',fromCity:'Great Falls',toCity:'Bismarck',miles:350,avgRate:870,avgRPM:2.49,volume:15,trend:'up',commodity:'Oil Field Equip'},
    ]},
  NE: { id:'NE', name:'Nebraska',      avgRPM:2.18, avgProfit:2050, volume:148,
    seasonal:[.87,.89,.95,1.04,1.10,1.06,.99,.97,1.02,1.04,.98,.88],
    lanes:[
      {from:'NE',to:'IL',fromCity:'Omaha',toCity:'Chicago',miles:460,avgRate:1050,avgRPM:2.28,volume:42,trend:'up',commodity:'Grain/Agricultural'},
      {from:'NE',to:'TX',fromCity:'Lincoln',toCity:'Dallas',miles:730,avgRate:1620,avgRPM:2.22,volume:30,trend:'flat',commodity:'Cattle/Livestock'},
      {from:'NE',to:'CO',fromCity:'Omaha',toCity:'Denver',miles:540,avgRate:1200,avgRPM:2.22,volume:25,trend:'up',commodity:'General Freight'},
    ]},
  NV: { id:'NV', name:'Nevada',        avgRPM:2.35, avgProfit:2400, volume:172,
    seasonal:[1.02,1.04,1.05,1.02,.96,.88,.85,.88,.95,1.02,1.05,1.06],
    lanes:[
      {from:'NV',to:'CA',fromCity:'Las Vegas',toCity:'Los Angeles',miles:270,avgRate:680,avgRPM:2.52,volume:52,trend:'up',commodity:'Consumer Goods'},
      {from:'NV',to:'AZ',fromCity:'Las Vegas',toCity:'Phoenix',miles:290,avgRate:710,avgRPM:2.45,volume:38,trend:'flat',commodity:'General Freight'},
      {from:'CA',to:'NV',fromCity:'Los Angeles',toCity:'Reno',miles:440,avgRate:1020,avgRPM:2.32,volume:28,trend:'up',commodity:'Retail'},
    ]},
  NH: { id:'NH', name:'New Hampshire', avgRPM:2.80, avgProfit:2100, volume:58,
    seasonal:[.88,.90,.95,1.02,1.06,1.04,1.08,1.08,1.04,1.04,1.0,.90],
    lanes:[
      {from:'NH',to:'MA',fromCity:'Manchester',toCity:'Boston',miles:55,avgRate:175,avgRPM:3.18,volume:20,trend:'up',commodity:'General Freight'},
      {from:'NH',to:'NY',fromCity:'Concord',toCity:'Albany',miles:175,avgRate:510,avgRPM:2.91,volume:15,trend:'flat',commodity:'Manufacturing'},
    ]},
  NJ: { id:'NJ', name:'New Jersey',    avgRPM:2.95, avgProfit:2350, volume:188,
    seasonal:[.92,.94,.98,1.03,1.06,1.02,.98,.97,1.02,1.06,1.04,.94],
    lanes:[
      {from:'NJ',to:'NY',fromCity:'Newark',toCity:'New York',miles:20,avgRate:95,avgRPM:4.75,volume:55,trend:'up',commodity:'LTL/General'},
      {from:'NJ',to:'PA',fromCity:'Trenton',toCity:'Philadelphia',miles:35,avgRate:120,avgRPM:3.43,volume:42,trend:'flat',commodity:'Pharma/Chemicals'},
      {from:'NJ',to:'MD',fromCity:'Newark',toCity:'Baltimore',miles:170,avgRate:510,avgRPM:3.00,volume:30,trend:'up',commodity:'Port/Intermodal'},
    ]},
  NM: { id:'NM', name:'New Mexico',    avgRPM:2.25, avgProfit:2150, volume:128,
    seasonal:[1.0,1.02,1.05,1.02,.96,.90,.88,.90,.95,1.0,1.02,1.02],
    lanes:[
      {from:'NM',to:'TX',fromCity:'Albuquerque',toCity:'El Paso',miles:280,avgRate:640,avgRPM:2.29,volume:38,trend:'flat',commodity:'General Freight'},
      {from:'NM',to:'AZ',fromCity:'Albuquerque',toCity:'Phoenix',miles:450,avgRate:1050,avgRPM:2.33,volume:28,trend:'up',commodity:'Dry Van'},
      {from:'TX',to:'NM',fromCity:'El Paso',toCity:'Albuquerque',miles:280,avgRate:610,avgRPM:2.18,volume:22,trend:'down',commodity:'Industrial'},
    ]},
  NY: { id:'NY', name:'New York',      avgRPM:2.85, avgProfit:2680, volume:318,
    seasonal:[.90,.92,.97,1.02,1.06,1.03,.98,.97,1.02,1.06,1.05,.92],
    lanes:[
      {from:'NY',to:'NJ',fromCity:'New York',toCity:'Newark',miles:20,avgRate:88,avgRPM:4.40,volume:75,trend:'up',commodity:'LTL/Express'},
      {from:'NY',to:'PA',fromCity:'New York',toCity:'Philadelphia',miles:95,avgRate:300,avgRPM:3.16,volume:58,trend:'up',commodity:'General/Pharma'},
      {from:'NY',to:'MA',fromCity:'Albany',toCity:'Boston',miles:170,avgRate:510,avgRPM:3.00,volume:42,trend:'flat',commodity:'Consumer Goods'},
      {from:'NY',to:'FL',fromCity:'New York',toCity:'Miami',miles:1280,avgRate:3200,avgRPM:2.50,volume:32,trend:'up',commodity:'Retail/Furniture'},
    ]},
  NC: { id:'NC', name:'North Carolina', avgRPM:2.38, avgProfit:2100, volume:235,
    seasonal:[.93,.95,.99,1.04,1.06,1.02,.98,.98,1.02,1.06,1.03,.93],
    lanes:[
      {from:'NC',to:'GA',fromCity:'Charlotte',toCity:'Atlanta',miles:245,avgRate:620,avgRPM:2.53,volume:62,trend:'up',commodity:'Automotive/Textiles'},
      {from:'NC',to:'VA',fromCity:'Raleigh',toCity:'Richmond',miles:165,avgRate:415,avgRPM:2.52,volume:48,trend:'flat',commodity:'Manufacturing'},
      {from:'NC',to:'NY',fromCity:'Charlotte',toCity:'New York',miles:640,avgRate:1640,avgRPM:2.56,volume:35,trend:'up',commodity:'Consumer Products'},
    ]},
  ND: { id:'ND', name:'North Dakota',  avgRPM:2.38, avgProfit:2650, volume:78,
    seasonal:[.75,.78,.88,1.0,1.10,1.10,1.05,1.05,1.05,1.02,.90,.78],
    lanes:[
      {from:'ND',to:'MN',fromCity:'Fargo',toCity:'Minneapolis',miles:240,avgRate:600,avgRPM:2.50,volume:25,trend:'up',commodity:'Grain/Ag'},
      {from:'ND',to:'MT',fromCity:'Bismarck',toCity:'Billings',miles:350,avgRate:880,avgRPM:2.51,volume:18,trend:'flat',commodity:'Oil Field Equip'},
      {from:'ND',to:'IL',fromCity:'Grand Forks',toCity:'Chicago',miles:680,avgRate:1620,avgRPM:2.38,volume:15,trend:'up',commodity:'Agricultural'},
    ]},
  OH: { id:'OH', name:'Ohio',          avgRPM:2.20, avgProfit:1780, volume:352,
    seasonal:[.88,.90,.96,1.03,1.07,1.04,1.0,.98,1.03,1.06,1.02,.90],
    lanes:[
      {from:'OH',to:'IL',fromCity:'Columbus',toCity:'Chicago',miles:360,avgRate:820,avgRPM:2.28,volume:88,trend:'up',commodity:'Manufacturing'},
      {from:'OH',to:'PA',fromCity:'Cleveland',toCity:'Pittsburgh',miles:130,avgRate:310,avgRPM:2.38,volume:72,trend:'flat',commodity:'Steel/Auto'},
      {from:'OH',to:'GA',fromCity:'Cincinnati',toCity:'Atlanta',miles:440,avgRate:1010,avgRPM:2.30,volume:52,trend:'up',commodity:'Automotive'},
      {from:'MI',to:'OH',fromCity:'Detroit',toCity:'Toledo',miles:60,avgRate:155,avgRPM:2.58,volume:45,trend:'flat',commodity:'Auto Parts'},
    ]},
  OK: { id:'OK', name:'Oklahoma',      avgRPM:2.22, avgProfit:2050, volume:165,
    seasonal:[.90,.92,.97,1.04,1.06,1.0,.94,.94,.98,1.04,1.02,.92],
    lanes:[
      {from:'OK',to:'TX',fromCity:'Oklahoma City',toCity:'Dallas',miles:205,avgRate:480,avgRPM:2.34,volume:50,trend:'flat',commodity:'Oil Field/Industrial'},
      {from:'OK',to:'MO',fromCity:'Tulsa',toCity:'Kansas City',miles:250,avgRate:580,avgRPM:2.32,volume:38,trend:'up',commodity:'General Freight'},
      {from:'TX',to:'OK',fromCity:'Dallas',toCity:'Oklahoma City',miles:205,avgRate:440,avgRPM:2.15,volume:32,trend:'down',commodity:'General Freight'},
    ]},
  OR: { id:'OR', name:'Oregon',        avgRPM:2.52, avgProfit:2700, volume:152,
    seasonal:[.92,.94,.98,1.04,1.08,1.06,1.02,1.02,1.05,1.04,.98,.93],
    lanes:[
      {from:'OR',to:'CA',fromCity:'Portland',toCity:'Los Angeles',miles:1000,avgRate:2700,avgRPM:2.70,volume:42,trend:'up',commodity:'Produce/Reefer'},
      {from:'OR',to:'WA',fromCity:'Eugene',toCity:'Seattle',miles:285,avgRate:740,avgRPM:2.60,volume:35,trend:'flat',commodity:'Agricultural/Lumber'},
      {from:'CA',to:'OR',fromCity:'Sacramento',toCity:'Portland',miles:580,avgRate:1480,avgRPM:2.55,volume:28,trend:'up',commodity:'General Freight'},
    ]},
  PA: { id:'PA', name:'Pennsylvania',  avgRPM:2.68, avgProfit:2200, volume:298,
    seasonal:[.90,.92,.97,1.02,1.06,1.03,.98,.97,1.02,1.06,1.04,.92],
    lanes:[
      {from:'PA',to:'NY',fromCity:'Philadelphia',toCity:'New York',miles:95,avgRate:290,avgRPM:3.05,volume:78,trend:'up',commodity:'Pharma/Healthcare'},
      {from:'PA',to:'OH',fromCity:'Pittsburgh',toCity:'Cleveland',miles:130,avgRate:340,avgRPM:2.62,volume:62,trend:'flat',commodity:'Steel/Manufacturing'},
      {from:'PA',to:'MD',fromCity:'Philadelphia',toCity:'Baltimore',miles:100,avgRate:280,avgRPM:2.80,volume:48,trend:'up',commodity:'General/LTL'},
    ]},
  RI: { id:'RI', name:'Rhode Island',  avgRPM:2.90, avgProfit:1950, volume:42,
    seasonal:[.90,.92,.97,1.02,1.06,1.03,.98,.97,1.02,1.06,1.04,.92],
    lanes:[
      {from:'RI',to:'MA',fromCity:'Providence',toCity:'Boston',miles:50,avgRate:155,avgRPM:3.10,volume:15,trend:'up',commodity:'General Freight'},
      {from:'RI',to:'CT',fromCity:'Providence',toCity:'Hartford',miles:80,avgRate:245,avgRPM:3.06,volume:12,trend:'flat',commodity:'Manufacturing'},
    ]},
  SC: { id:'SC', name:'South Carolina', avgRPM:2.32, avgProfit:2050, volume:165,
    seasonal:[.94,.96,1.0,1.04,1.06,1.02,.98,.98,1.02,1.06,1.02,.93],
    lanes:[
      {from:'SC',to:'GA',fromCity:'Columbia',toCity:'Atlanta',miles:215,avgRate:520,avgRPM:2.42,volume:45,trend:'up',commodity:'Auto/BMW Parts'},
      {from:'SC',to:'NC',fromCity:'Charleston',toCity:'Charlotte',miles:250,avgRate:600,avgRPM:2.40,volume:38,trend:'flat',commodity:'Port/Intermodal'},
      {from:'GA',to:'SC',fromCity:'Savannah',toCity:'Greenville',miles:240,avgRate:570,avgRPM:2.38,volume:28,trend:'up',commodity:'Manufacturing'},
    ]},
  SD: { id:'SD', name:'South Dakota',  avgRPM:2.30, avgProfit:2250, volume:68,
    seasonal:[.78,.80,.90,1.02,1.10,1.08,1.04,1.04,1.05,1.02,.90,.80],
    lanes:[
      {from:'SD',to:'MN',fromCity:'Sioux Falls',toCity:'Minneapolis',miles:240,avgRate:580,avgRPM:2.42,volume:22,trend:'up',commodity:'Agricultural/Pork'},
      {from:'SD',to:'NE',fromCity:'Rapid City',toCity:'Omaha',miles:350,avgRate:820,avgRPM:2.34,volume:18,trend:'flat',commodity:'Livestock'},
    ]},
  TN: { id:'TN', name:'Tennessee',     avgRPM:2.28, avgProfit:1950, volume:285,
    seasonal:[.91,.93,.98,1.03,1.06,1.02,.97,.97,1.02,1.06,1.02,.92],
    lanes:[
      {from:'TN',to:'GA',fromCity:'Nashville',toCity:'Atlanta',miles:250,avgRate:620,avgRPM:2.48,volume:72,trend:'up',commodity:'Automotive'},
      {from:'TN',to:'TX',fromCity:'Memphis',toCity:'Dallas',miles:470,avgRate:1120,avgRPM:2.38,volume:55,trend:'flat',commodity:'General/Retail'},
      {from:'TN',to:'IL',fromCity:'Nashville',toCity:'Chicago',miles:470,avgRate:1100,avgRPM:2.34,volume:42,trend:'up',commodity:'CPG/Retail'},
      {from:'GA',to:'TN',fromCity:'Atlanta',toCity:'Nashville',miles:250,avgRate:590,avgRPM:2.36,volume:38,trend:'flat',commodity:'Automotive'},
    ]},
  TX: { id:'TX', name:'Texas',         avgRPM:2.30, avgProfit:2850, volume:620,
    seasonal:[.95,.97,1.0,1.02,1.04,1.04,1.04,1.04,1.02,1.0,.98,.96],
    lanes:[
      {from:'TX',to:'CA',fromCity:'Dallas',toCity:'Los Angeles',miles:1420,avgRate:3350,avgRPM:2.36,volume:120,trend:'flat',commodity:'Electronics/Auto'},
      {from:'TX',to:'IL',fromCity:'Houston',toCity:'Chicago',miles:1090,avgRate:2500,avgRPM:2.29,volume:95,trend:'up',commodity:'Petrochemical'},
      {from:'TX',to:'GA',fromCity:'Dallas',toCity:'Atlanta',miles:780,avgRate:1850,avgRPM:2.37,volume:72,trend:'up',commodity:'General Freight'},
      {from:'TX',to:'FL',fromCity:'Houston',toCity:'Miami',miles:1180,avgRate:2700,avgRPM:2.29,volume:55,trend:'flat',commodity:'Construction Materials'},
      {from:'TX',to:'NY',fromCity:'Dallas',toCity:'New York',miles:1550,avgRate:3600,avgRPM:2.32,volume:42,trend:'up',commodity:'Retail/CPG'},
    ]},
  UT: { id:'UT', name:'Utah',          avgRPM:2.38, avgProfit:2350, volume:135,
    seasonal:[.90,.92,.97,1.04,1.08,1.05,1.0,.98,1.02,1.04,1.0,.92],
    lanes:[
      {from:'UT',to:'CA',fromCity:'Salt Lake City',toCity:'Los Angeles',miles:690,avgRate:1750,avgRPM:2.54,volume:38,trend:'up',commodity:'Technology/Electronics'},
      {from:'UT',to:'CO',fromCity:'Provo',toCity:'Denver',miles:480,avgRate:1170,avgRPM:2.44,volume:28,trend:'flat',commodity:'Manufacturing'},
      {from:'CA',to:'UT',fromCity:'Los Angeles',toCity:'Salt Lake City',miles:690,avgRate:1590,avgRPM:2.30,volume:22,trend:'up',commodity:'Consumer Goods'},
    ]},
  VT: { id:'VT', name:'Vermont',       avgRPM:2.75, avgProfit:2050, volume:42,
    seasonal:[.82,.84,.92,.98,1.06,1.06,1.08,1.08,1.05,1.04,.98,.85],
    lanes:[
      {from:'VT',to:'MA',fromCity:'Burlington',toCity:'Boston',miles:215,avgRate:620,avgRPM:2.88,volume:15,trend:'up',commodity:'General/Dairy'},
      {from:'VT',to:'NY',fromCity:'Montpelier',toCity:'Albany',miles:155,avgRate:445,avgRPM:2.87,volume:12,trend:'flat',commodity:'Agricultural'},
    ]},
  VA: { id:'VA', name:'Virginia',      avgRPM:2.55, avgProfit:2250, volume:218,
    seasonal:[.92,.94,.98,1.03,1.06,1.02,.98,.97,1.02,1.06,1.03,.93],
    lanes:[
      {from:'VA',to:'MD',fromCity:'Richmond',toCity:'Baltimore',miles:150,avgRate:415,avgRPM:2.77,volume:58,trend:'up',commodity:'Government/Defense'},
      {from:'VA',to:'NC',fromCity:'Norfolk',toCity:'Charlotte',miles:310,avgRate:820,avgRPM:2.65,volume:42,trend:'flat',commodity:'Port/Intermodal'},
      {from:'VA',to:'GA',fromCity:'Roanoke',toCity:'Atlanta',miles:490,avgRate:1250,avgRPM:2.55,volume:30,trend:'up',commodity:'Manufacturing'},
    ]},
  WA: { id:'WA', name:'Washington',    avgRPM:2.65, avgProfit:3050, volume:198,
    seasonal:[.88,.90,.95,1.02,1.08,1.10,1.08,1.06,1.05,1.02,.93,.88],
    lanes:[
      {from:'WA',to:'CA',fromCity:'Seattle',toCity:'Los Angeles',miles:1140,avgRate:3100,avgRPM:2.72,volume:52,trend:'up',commodity:'Tech/Consumer Elec'},
      {from:'WA',to:'OR',fromCity:'Seattle',toCity:'Portland',miles:175,avgRate:475,avgRPM:2.71,volume:42,trend:'flat',commodity:'General/Produce'},
      {from:'WA',to:'ID',fromCity:'Spokane',toCity:'Boise',miles:310,avgRate:820,avgRPM:2.65,volume:28,trend:'up',commodity:'Agricultural'},
    ]},
  WV: { id:'WV', name:'West Virginia', avgRPM:2.30, avgProfit:1850, volume:98,
    seasonal:[.88,.90,.96,1.03,1.06,1.02,.98,.97,1.02,1.06,1.02,.90],
    lanes:[
      {from:'WV',to:'PA',fromCity:'Charleston',toCity:'Pittsburgh',miles:145,avgRate:360,avgRPM:2.48,volume:28,trend:'up',commodity:'Coal/Industrial'},
      {from:'WV',to:'OH',fromCity:'Huntington',toCity:'Columbus',miles:150,avgRate:370,avgRPM:2.47,volume:22,trend:'flat',commodity:'Manufacturing'},
    ]},
  WI: { id:'WI', name:'Wisconsin',     avgRPM:2.24, avgProfit:2050, volume:198,
    seasonal:[.82,.84,.92,1.02,1.10,1.08,1.04,1.02,1.05,1.06,1.0,.84],
    lanes:[
      {from:'WI',to:'IL',fromCity:'Milwaukee',toCity:'Chicago',miles:92,avgRate:235,avgRPM:2.55,volume:58,trend:'up',commodity:'Manufacturing/Dairy'},
      {from:'WI',to:'MN',fromCity:'Green Bay',toCity:'Minneapolis',miles:320,avgRate:760,avgRPM:2.38,volume:38,trend:'flat',commodity:'Dairy/Food'},
      {from:'WI',to:'MI',fromCity:'Milwaukee',toCity:'Grand Rapids',miles:170,avgRate:415,avgRPM:2.44,volume:28,trend:'up',commodity:'Automotive'},
    ]},
  WY: { id:'WY', name:'Wyoming',       avgRPM:2.40, avgProfit:2600, volume:65,
    seasonal:[.80,.82,.88,.98,1.08,1.10,1.08,1.06,1.05,1.02,.90,.80],
    lanes:[
      {from:'WY',to:'CO',fromCity:'Cheyenne',toCity:'Denver',miles:100,avgRate:265,avgRPM:2.65,volume:22,trend:'up',commodity:'General Freight'},
      {from:'WY',to:'MT',fromCity:'Casper',toCity:'Billings',miles:230,avgRate:580,avgRPM:2.52,volume:15,trend:'flat',commodity:'Energy/Oil Field'},
    ]},
}

// ─── SVG State Polygon Data (approximate Albers-like, 960×600) ────────────────
const STATE_POLYGONS: Record<string, string> = {
  WA: "105,45 300,45 300,62 288,140 105,140",
  OR: "105,140 290,140 290,215 105,215",
  CA: "105,215 210,215 215,265 215,360 182,440 148,472 105,460",
  NV: "210,190 285,178 292,370 238,398 210,370",
  ID: "285,45 385,45 392,68 398,155 348,215 292,215 292,130",
  MT: "288,45 575,45 572,152 398,152 392,68 310,62",
  WY: "340,150 507,150 507,258 340,258",
  UT: "278,214 342,214 342,368 278,368",
  CO: "340,254 510,254 510,362 340,362",
  AZ: "218,362 355,362 355,478 218,478",
  NM: "342,358 512,358 512,472 342,472",
  ND: "425,45 635,45 635,125 425,125",
  SD: "422,122 635,122 635,202 422,202",
  NE: "432,198 642,198 642,272 432,272",
  KS: "432,268 648,268 648,352 432,352",
  OK: "432,348 568,348 568,348 684,348 684,396 555,400 555,424 432,424",
  TX: "432,420 555,420 555,396 684,392 700,430 665,548 475,548 448,508",
  MN: "565,38 635,38 635,122 695,122 695,202 565,202",
  IA: "565,198 722,198 722,268 565,268",
  MO: "565,264 742,264 742,376 598,382 565,368",
  AR: "572,372 738,372 738,448 572,448",
  LA: "572,444 692,444 712,518 572,518",
  WI: "632,98 695,92 768,108 768,202 695,202 695,128 720,122 668,98",
  MI: "762,142 858,142 862,188 838,218 792,232 762,214",
  IL: "695,198 762,198 762,338 695,338",
  IN: "758,198 802,198 802,308 758,308",
  OH: "798,198 878,198 878,312 798,312",
  KY: "668,308 824,308 824,362 762,378 668,358",
  TN: "612,358 802,358 802,402 612,402",
  MS: "648,398 712,398 712,518 648,518",
  AL: "708,394 768,394 768,518 708,518",
  GA: "762,388 872,388 878,512 762,512",
  FL: "760,508 872,508 922,572 832,578 792,548",
  SC: "822,378 878,378 878,448 828,452 822,422",
  NC: "692,342 862,342 862,392 762,398 692,388",
  VA: "722,292 868,292 868,358 792,362 722,348",
  WV: "798,262 865,262 865,312 842,342 798,338",
  MD: "796,264 865,264 865,298 828,305 796,294",
  DE: "878,244 898,244 898,288 878,288",
  NJ: "862,195 898,195 898,258 862,258",
  PA: "700,200 864,200 864,268 700,268",
  NY: "690,88 858,88 858,202 764,218 722,218 695,182",
  CT: "848,165 898,165 898,192 848,192",
  RI: "896,165 916,165 916,192 896,192",
  MA: "796,145 898,145 898,168 796,168",
  VT: "822,80 852,80 852,150 822,150",
  NH: "848,75 874,75 874,150 848,150",
  ME: "860,30 906,30 906,105 860,105",
  AK: "28,458 185,458 185,568 28,568",
  HI: "228,538 368,538 368,582 228,582",
}

// Approximate centroids for labels (x, y)
const STATE_CENTROIDS: Record<string, [number, number]> = {
  WA:[198,88], OR:[198,178], CA:[158,338], NV:[248,285], ID:[335,128],
  MT:[430,98], WY:[422,204], UT:[308,290], CO:[424,308], AZ:[285,420],
  NM:[425,415], ND:[528,85], SD:[525,162], NE:[535,235], KS:[538,310],
  OK:[558,384], TX:[565,470], MN:[628,148], IA:[640,232], MO:[650,322],
  AR:[648,408], LA:[635,478], WI:[698,155], MI:[808,185], IL:[728,268],
  IN:[780,254], OH:[836,255], KY:[740,338], TN:[705,380], MS:[678,455],
  AL:[736,455], GA:[818,448], FL:[838,540], SC:[848,412], NC:[775,370],
  VA:[792,325], WV:[830,298], MD:[830,282], DE:[886,265], NJ:[878,228],
  PA:[780,234], NY:[775,152], CT:[870,178], RI:[905,178], MA:[845,156],
  VT:[836,114], NH:[860,112], ME:[882,68], AK:[105,512], HI:[295,560],
}

// ─── Color Scale ──────────────────────────────────────────────────────────────
function metricValue(s: StateData, metric: HeatMetric): number {
  if (metric === 'rpm') return s.avgRPM
  if (metric === 'profit') return s.avgProfit
  return s.volume
}

function getColorForMetric(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // Green → Yellow → Red (inverted: high = green = good)
  if (t < 0.5) {
    // red → yellow
    const r = 220
    const g = Math.round(60 + t * 2 * 160)
    return `rgb(${r},${g},60)`
  } else {
    // yellow → green
    const r = Math.round(220 - (t - 0.5) * 2 * 160)
    const g = 220
    return `rgb(${r},${g},60)`
  }
}

// ─── Seasonal Chart ───────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function SeasonalChart({ data, stateAvgRPM }: { data: number[]; stateAvgRPM: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const h = 80

  return (
    <div>
      <div style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>
        📅 Monthly Rate Index — higher = better rates available
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h + 20 }}>
        {data.map((v, i) => {
          const pct = (v - min) / (max - min || 1)
          const barH = 16 + pct * (h - 16)
          const color = v >= 1.04 ? '#38C770' : v >= 0.97 ? '#F6AD55' : '#FC8181'
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: 9, color: '#718096' }}>
                {(stateAvgRPM * v).toFixed(2)}
              </div>
              <div style={{
                width: '100%', height: barH, background: color,
                borderRadius: '3px 3px 0 0', minWidth: 4,
              }} />
              <div style={{ fontSize: 9, color: '#718096', transform: 'rotate(-45deg)', transformOrigin: 'center', marginTop: 2 }}>
                {MONTHS[i]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Top Lane Row ─────────────────────────────────────────────────────────────
function LaneRow({ lane, highlight }: { lane: Lane; highlight: string }) {
  const isOut = lane.from === highlight
  const trendIcon = lane.trend === 'up' ? '↑' : lane.trend === 'down' ? '↓' : '→'
  const trendColor = lane.trend === 'up' ? '#38C770' : lane.trend === 'down' ? '#FC8181' : '#F6AD55'

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8, marginBottom: 6,
      background: isOut ? '#EBF8FF' : '#F7FAFC',
      border: `1px solid ${isOut ? '#BEE3F8' : '#E2E8F0'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>
          <span style={{ color: isOut ? '#2D7A9A' : '#718096' }}>{lane.fromCity}, {lane.from}</span>
          <span style={{ color: '#A0AEC0', margin: '0 4px' }}>→</span>
          <span style={{ color: !isOut ? '#2D7A9A' : '#718096' }}>{lane.toCity}, {lane.to}</span>
        </div>
        <span style={{ color: trendColor, fontWeight: 700, fontSize: 13 }}>{trendIcon}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ color: '#718096' }}>Avg Rate: </span>
          <strong>${lane.avgRate.toLocaleString()}</strong>
        </div>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ color: '#718096' }}>RPM: </span>
          <strong style={{ color: lane.avgRPM >= 2.5 ? '#276749' : lane.avgRPM >= 2.2 ? '#7B4F1A' : '#7B1A1A' }}>
            ${lane.avgRPM.toFixed(2)}
          </strong>
        </div>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ color: '#718096' }}>Miles: </span>
          <strong>{lane.miles.toLocaleString()}</strong>
        </div>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ color: '#718096' }}>Trips/90d: </span>
          <strong>{lane.volume}</strong>
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#718096', marginTop: 3 }}>
        📦 {lane.commodity}
      </div>
    </div>
  )
}

// ─── City coordinates for lane route map ─────────────────────────────────────
const LANE_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Jacksonville': { lat: 30.332, lng: -81.656 },
  'Atlanta':      { lat: 33.749, lng: -84.388 },
  'Miami':        { lat: 25.761, lng: -80.192 },
  'Charlotte':    { lat: 35.227, lng: -80.843 },
  'Tampa':        { lat: 27.948, lng: -82.459 },
  'Houston':      { lat: 29.760, lng: -95.369 },
  'Orlando':      { lat: 28.538, lng: -81.379 },
  'New York':     { lat: 40.713, lng: -74.006 },
  'Chicago':      { lat: 41.878, lng: -87.630 },
  'Dallas':       { lat: 32.776, lng: -96.797 },
  'Los Angeles':  { lat: 34.052, lng: -118.244 },
  'Phoenix':      { lat: 33.448, lng: -112.074 },
  'Denver':       { lat: 39.739, lng: -104.984 },
  'Seattle':      { lat: 47.608, lng: -122.335 },
  'Minneapolis':  { lat: 44.980, lng: -93.265 },
  'Kansas City':  { lat: 39.099, lng: -94.579 },
  'Nashville':    { lat: 36.174, lng: -86.767 },
  'Memphis':      { lat: 35.150, lng: -90.048 },
  'Indianapolis': { lat: 39.768, lng: -86.158 },
  'Columbus':     { lat: 39.961, lng: -82.999 },
  'Louisville':   { lat: 38.252, lng: -85.758 },
  'Detroit':      { lat: 42.331, lng: -83.046 },
  'Cleveland':    { lat: 41.500, lng: -81.695 },
  'Pittsburgh':   { lat: 40.440, lng: -79.996 },
  'Philadelphia': { lat: 39.952, lng: -75.164 },
  'Boston':       { lat: 42.360, lng: -71.059 },
  'Baltimore':    { lat: 39.290, lng: -76.612 },
  'Richmond':     { lat: 37.541, lng: -77.434 },
  'Raleigh':      { lat: 35.779, lng: -78.638 },
  'Savannah':     { lat: 32.082, lng: -81.100 },
  'New Orleans':  { lat: 29.951, lng: -90.072 },
  'Baton Rouge':  { lat: 30.451, lng: -91.154 },
  'St. Louis':    { lat: 38.627, lng: -90.197 },
  'Oklahoma City':{ lat: 35.468, lng: -97.516 },
  'Tulsa':        { lat: 36.154, lng: -95.993 },
  'San Antonio':  { lat: 29.424, lng: -98.494 },
  'El Paso':      { lat: 31.758, lng: -106.488 },
  'Albuquerque':  { lat: 35.085, lng: -106.650 },
  'Salt Lake City':{ lat: 40.760, lng: -111.891 },
  'Las Vegas':    { lat: 36.175, lng: -115.136 },
  'Sacramento':   { lat: 38.581, lng: -121.494 },
  'San Francisco':{ lat: 37.774, lng: -122.419 },
  'San Diego':    { lat: 32.716, lng: -117.161 },
  'Portland':     { lat: 45.523, lng: -122.676 },
  'Spokane':      { lat: 47.659, lng: -117.426 },
  'Boise':        { lat: 43.615, lng: -116.202 },
  'Pocatello':    { lat: 42.866, lng: -112.446 },
  'Des Moines':   { lat: 41.600, lng: -93.609 },
  'Iowa City':    { lat: 41.661, lng: -91.530 },
  'Omaha':        { lat: 41.257, lng: -95.938 },
  'Wichita':      { lat: 37.688, lng: -97.336 },
  'Lexington':    { lat: 38.040, lng: -84.503 },
  'Honolulu':     { lat: 21.306, lng: -157.858 },
  'Portland ME':  { lat: 43.658, lng: -70.257 },
  'Bangor':       { lat: 44.801, lng: -68.778 },
  'Augusta':      { lat: 44.311, lng: -69.779 },
  'Billings':     { lat: 45.786, lng: -108.501 },
  'Cheyenne':     { lat: 41.140, lng: -104.820 },
  'Casper':       { lat: 42.867, lng: -106.313 },
}

function laneToWaypoints(fromCity: string, fromState: string, toCity: string, toState: string): RouteWaypoint[] {
  const orig = LANE_CITY_COORDS[fromCity]
  const dest = LANE_CITY_COORDS[toCity]
  if (!orig || !dest) return []
  return [
    { lat: orig.lat, lng: orig.lng, label: `${fromCity}, ${fromState}`, type: 'origin' },
    { lat: dest.lat, lng: dest.lng, label: `${toCity}, ${toState}`,   type: 'destination' },
  ]
}

// ─── State Detail Panel ───────────────────────────────────────────────────────
function StateDetailPanel({ stateId, metric }: { stateId: string | null; metric: HeatMetric }) {
  const [lanesFilter, setLanesFilter] = useState<'all' | 'out' | 'in'>('all')
  const [selectedLaneIdx, setSelectedLaneIdx] = useState<number | null>(null)

  if (!stateId || !STATE_DATA[stateId]) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#A0AEC0', gap: 12, padding: 32,
      }}>
        <div style={{ fontSize: 48 }}>🗺️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#718096' }}>Click a state</div>
        <div style={{ fontSize: 13, textAlign: 'center' }}>
          Select any state on the map to see top lanes, rate data, and seasonality
        </div>
      </div>
    )
  }

  const s = STATE_DATA[stateId]
  const filteredLanes = s.lanes.filter(l =>
    lanesFilter === 'all' ? true :
    lanesFilter === 'out' ? l.from === stateId :
    l.to === stateId
  )

  // Stats
  const outLanes = s.lanes.filter(l => l.from === stateId)
  const outAvgRPM = outLanes.length > 0
    ? outLanes.reduce((a, l) => a + l.avgRPM, 0) / outLanes.length
    : s.avgRPM
  const bestLane = [...s.lanes].sort((a, b) => b.avgRPM - a.avgRPM)[0]
  const peakMonth = s.seasonal.indexOf(Math.max(...s.seasonal))
  const slowMonth = s.seasonal.indexOf(Math.min(...s.seasonal))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid #E2E8F0',
        background: 'linear-gradient(135deg, #EBF8FF, #F7FAFC)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535', marginBottom: 2 }}>
          {s.name}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[
            { label: 'Avg RPM', value: `$${s.avgRPM.toFixed(2)}`, color: s.avgRPM >= 2.6 ? '#276749' : s.avgRPM >= 2.3 ? '#7B4F1A' : '#7B1A1A', bg: s.avgRPM >= 2.6 ? '#F0FFF4' : s.avgRPM >= 2.3 ? '#FFFAF0' : '#FFF5F5' },
            { label: 'Avg Profit', value: `$${s.avgProfit.toLocaleString()}`, color: '#2D7A9A', bg: '#EBF8FF' },
            { label: 'Trips/90d', value: String(s.volume), color: '#5A4A1A', bg: '#FFFAF0' },
          ].map(item => (
            <div key={item.label} style={{ background: item.bg, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick insights */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {bestLane && (
            <div style={{
              padding: '5px 10px', background: '#F0FFF4',
              border: '1px solid #9AE6B4', borderRadius: 20,
              fontSize: 11, color: '#276749',
            }}>
              🏆 Best: {bestLane.from}→{bestLane.to} @ ${bestLane.avgRPM.toFixed(2)}/mi
            </div>
          )}
          <div style={{
            padding: '5px 10px', background: '#EBF8FF',
            border: '1px solid #BEE3F8', borderRadius: 20,
            fontSize: 11, color: '#2D7A9A',
          }}>
            📈 Peak: {MONTHS[peakMonth]} ({(s.seasonal[peakMonth] * s.avgRPM).toFixed(2)}/mi)
          </div>
          <div style={{
            padding: '5px 10px', background: '#FFFAF0',
            border: '1px solid #FBBF24', borderRadius: 20,
            fontSize: 11, color: '#7B4F1A',
          }}>
            📉 Slow: {MONTHS[slowMonth]}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Seasonality */}
        <div style={{
          background: '#F7FAFC', borderRadius: 12,
          border: '1px solid #E2E8F0', padding: '14px',
          marginBottom: 16,
        }}>
          <SeasonalChart data={s.seasonal} stateAvgRPM={s.avgRPM} />
        </div>

        {/* Lanes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>
              Top Lanes ({s.lanes.length})
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'out', 'in'] as const).map(f => (
                <button key={f} onClick={() => setLanesFilter(f)} style={{
                  padding: '4px 10px', borderRadius: 14,
                  background: lanesFilter === f ? '#4BAED4' : '#F7FAFC',
                  border: `1px solid ${lanesFilter === f ? '#4BAED4' : '#E2E8F0'}`,
                  color: lanesFilter === f ? '#fff' : '#718096',
                  fontSize: 11, cursor: 'pointer', fontWeight: lanesFilter === f ? 700 : 400,
                }}>
                  {f === 'all' ? 'All' : f === 'out' ? '↗ Out' : '↙ In'}
                </button>
              ))}
            </div>
          </div>
          {filteredLanes.length > 0 ? (
            filteredLanes.map((lane, i) => (
              <div
                key={i}
                onClick={() => setSelectedLaneIdx(selectedLaneIdx === i ? null : i)}
                style={{ cursor: 'pointer', borderRadius: 8, outline: selectedLaneIdx === i ? '2px solid #4BAED4' : 'none' }}
              >
                <LaneRow lane={lane} highlight={stateId} />
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#A0AEC0', fontSize: 13 }}>
              No lanes in this direction
            </div>
          )}

          {/* Route map for selected lane */}
          {selectedLaneIdx !== null && filteredLanes[selectedLaneIdx] && (() => {
            const lane = filteredLanes[selectedLaneIdx]
            const wps = laneToWaypoints(lane.fromCity, lane.from, lane.toCity, lane.to)
            if (wps.length < 2) return null
            const center = { lat: (wps[0].lat + wps[1].lat) / 2, lng: (wps[0].lng + wps[1].lng) / 2 }
            return (
              <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid #BEE3F8' }}>
                <div style={{ padding: '6px 10px', background: '#EBF8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#2D7A9A' }}>
                    🗺️ {lane.fromCity} → {lane.toCity} · {lane.miles.toLocaleString()} mi · ${lane.avgRPM.toFixed(2)}/mi
                  </div>
                  <button
                    onClick={() => setSelectedLaneIdx(null)}
                    style={{ fontSize: 11, color: '#718096', background: 'none', border: 'none', cursor: 'pointer' }}
                  >✕</button>
                </div>
                <MapView
                  height={200}
                  center={center}
                  zoom={5}
                  waypoints={wps}
                  useDirections={true}
                  dark={false}
                  compact={true}
                />
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ─── Color Scale Legend ───────────────────────────────────────────────────────
function ColorLegend({ metric, min, max }: { metric: HeatMetric; min: number; max: number }) {
  const steps = 6
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: '#718096' }}>
        {metric === 'rpm' ? `$${min.toFixed(2)}/mi` : metric === 'profit' ? `$${min.toLocaleString()}` : min}
      </span>
      {Array.from({ length: steps }).map((_, i) => {
        const v = min + (i / (steps - 1)) * (max - min)
        return (
          <div key={i} style={{
            width: 24, height: 12, borderRadius: 2,
            background: getColorForMetric(v, min, max),
          }} />
        )
      })}
      <span style={{ fontSize: 10, color: '#718096' }}>
        {metric === 'rpm' ? `$${max.toFixed(2)}/mi` : metric === 'profit' ? `$${max.toLocaleString()}` : max}
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LaneHeatmapPage({ role: _role }: { role: UserRole }) {
  const [metric, setMetric] = useState<HeatMetric>('rpm')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  const { min, max } = useMemo(() => {
    const vals = Object.values(STATE_DATA).map(s => metricValue(s, metric))
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [metric])

  const METRIC_LABELS: Record<HeatMetric, string> = {
    rpm: 'Avg RPM ($/mi)',
    profit: 'Avg Profit ($/trip)',
    volume: 'Trip Volume (90d)',
  }

  const topStates = useMemo(() => {
    return Object.values(STATE_DATA)
      .sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
      .slice(0, 5)
  }, [metric])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7FAFC', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🗺️</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>Lane Profitability Heatmap</span>
          <span style={{ fontSize: 11, color: '#718096', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '2px 8px' }}>
            Last 90 days
          </span>
        </div>

        {/* Metric toggle */}
        <div style={{ display: 'flex', gap: 4, background: '#F7FAFC', borderRadius: 10, padding: 4, border: '1px solid #E2E8F0' }}>
          {(['rpm', 'profit', 'volume'] as HeatMetric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={{
              padding: '6px 14px', borderRadius: 7,
              background: metric === m ? '#4BAED4' : 'transparent',
              border: 'none', color: metric === m ? '#fff' : '#718096',
              fontWeight: metric === m ? 700 : 400,
              fontSize: 12, cursor: 'pointer',
            }}>
              {m === 'rpm' ? '📈 RPM' : m === 'profit' ? '💰 Profit' : '📦 Volume'}
            </button>
          ))}
        </div>

        {/* Legend */}
        <ColorLegend metric={metric} min={min} max={max} />
      </div>

      {/* Body: map + panel */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 0 }}>
        {/* Map area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Top states bar */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 16px',
            background: '#fff', borderBottom: '1px solid #E2E8F0', overflowX: 'auto',
          }}>
            <span style={{ fontSize: 11, color: '#718096', whiteSpace: 'nowrap', alignSelf: 'center' }}>
              Top by {METRIC_LABELS[metric]}:
            </span>
            {topStates.map((s, i) => (
              <button key={s.id} onClick={() => setSelectedState(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                background: selectedState === s.id ? '#EBF8FF' : '#F7FAFC',
                border: `1px solid ${selectedState === s.id ? '#4BAED4' : '#E2E8F0'}`,
                borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: getColorForMetric(metricValue(s, metric), min, max),
                  display: 'inline-block', flexShrink: 0,
                  border: '1px solid rgba(0,0,0,.1)',
                }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>
                  #{i + 1} {s.id}
                </span>
                <span style={{ fontSize: 11, color: '#718096' }}>
                  {metric === 'rpm' ? `$${s.avgRPM.toFixed(2)}` :
                   metric === 'profit' ? `$${s.avgProfit.toLocaleString()}` :
                   s.volume}
                </span>
              </button>
            ))}
          </div>

          {/* SVG Map */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 0', position: 'relative' }}>
            <svg
              viewBox="0 0 960 600"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* Ocean/background */}
              <rect x="0" y="0" width="960" height="600" fill="#EBF8FF" />

              {/* Inset box labels */}
              <text x="35" y="450" fontSize="9" fill="#718096" fontFamily="sans-serif">Alaska</text>
              <text x="230" y="532" fontSize="9" fill="#718096" fontFamily="sans-serif">Hawaii</text>
              <rect x="25" y="455" width="162" height="115" fill="none" stroke="#CBD5E0" strokeWidth="1" strokeDasharray="4,2" rx="3" />
              <rect x="225" y="535" width="145" height="50" fill="none" stroke="#CBD5E0" strokeWidth="1" strokeDasharray="4,2" rx="3" />

              {/* State polygons */}
              {Object.entries(STATE_POLYGONS).map(([stateId, pts]) => {
                const data = STATE_DATA[stateId]
                if (!data) return null
                const val = metricValue(data, metric)
                const fill = getColorForMetric(val, min, max)
                const isSelected = selectedState === stateId
                const isHovered = hoveredState === stateId

                return (
                  <g key={stateId}>
                    <polygon
                      points={pts}
                      fill={fill}
                      stroke={isSelected ? '#1A2535' : isHovered ? '#4BAED4' : '#fff'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.8}
                      style={{ cursor: 'pointer', transition: 'stroke 0.1s, stroke-width 0.1s' }}
                      onClick={() => setSelectedState(stateId === selectedState ? null : stateId)}
                      onMouseEnter={() => setHoveredState(stateId)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                    {/* State abbreviation label */}
                    {STATE_CENTROIDS[stateId] && (
                      <text
                        x={STATE_CENTROIDS[stateId][0]}
                        y={STATE_CENTROIDS[stateId][1]}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={stateId === 'RI' || stateId === 'DE' || stateId === 'CT' || stateId === 'NJ' ? 7 : 9}
                        fontWeight="700"
                        fill="rgba(0,0,0,0.65)"
                        fontFamily="sans-serif"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {stateId}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Highlight ring on selected */}
              {selectedState && STATE_POLYGONS[selectedState] && (
                <polygon
                  points={STATE_POLYGONS[selectedState]}
                  fill="none"
                  stroke="#1A2535"
                  strokeWidth="2.5"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </svg>

            {/* Hover tooltip */}
            {hoveredState && STATE_DATA[hoveredState] && (
              <div style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(26,37,53,.92)', color: '#fff',
                borderRadius: 10, padding: '10px 14px',
                pointerEvents: 'none', zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,.3)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {STATE_DATA[hoveredState].name}
                </div>
                <div style={{ fontSize: 12, color: '#BEE3F8' }}>
                  RPM: <strong style={{ color: '#fff' }}>${STATE_DATA[hoveredState].avgRPM.toFixed(2)}/mi</strong>
                </div>
                <div style={{ fontSize: 12, color: '#BEE3F8' }}>
                  Avg Profit: <strong style={{ color: '#fff' }}>${STATE_DATA[hoveredState].avgProfit.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#BEE3F8' }}>
                  Trips/90d: <strong style={{ color: '#fff' }}>{STATE_DATA[hoveredState].volume}</strong>
                </div>
                <div style={{ fontSize: 10, color: '#90CDF4', marginTop: 4 }}>Click to see lanes →</div>
              </div>
            )}
          </div>

          {/* Bottom stats bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid #E2E8F0', background: '#fff',
          }}>
            {[
              { label: 'National Avg RPM', value: `$${(Object.values(STATE_DATA).reduce((a,s)=>a+s.avgRPM,0)/Object.keys(STATE_DATA).length).toFixed(2)}/mi`, icon: '📊' },
              { label: 'Highest RPM State', value: `${Object.values(STATE_DATA).sort((a,b)=>b.avgRPM-a.avgRPM)[0].id} · $${Object.values(STATE_DATA).sort((a,b)=>b.avgRPM-a.avgRPM)[0].avgRPM.toFixed(2)}`, icon: '🏆' },
              { label: 'Most Active State', value: `${Object.values(STATE_DATA).sort((a,b)=>b.volume-a.volume)[0].id} · ${Object.values(STATE_DATA).sort((a,b)=>b.volume-a.volume)[0].volume} trips`, icon: '🚛' },
              { label: 'Best Avg Profit', value: `${Object.values(STATE_DATA).sort((a,b)=>b.avgProfit-a.avgProfit)[0].id} · $${Object.values(STATE_DATA).sort((a,b)=>b.avgProfit-a.avgProfit)[0].avgProfit.toLocaleString()}`, icon: '💰' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '10px 14px', borderRight: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right detail panel */}
        <div style={{
          width: 320, flexShrink: 0, borderLeft: '1px solid #E2E8F0',
          background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <StateDetailPanel stateId={selectedState} metric={metric} />
        </div>
      </div>
    </div>
  )
}
