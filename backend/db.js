import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Initial seed data generator
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);
  const adminHash = bcrypt.hashSync('admin123', salt);

  const locations = [
    {
      id: 'loc-1',
      name: 'Central Campus Library',
      code: 'LIB-MAIN',
      building: 'Academic Block A',
      floor: 'Floor 2 & 3',
      lat: 12.9716,
      lng: 77.5946,
      manager: 'Dr. K. Ramesh',
      phone: '+1 (555) 019-4011',
      hours: '08:00 AM - 10:00 PM',
      icon: 'Library',
    },
    {
      id: 'loc-2',
      name: 'Alan Turing CS Lab',
      code: 'CS-304',
      building: 'Technology Tower',
      floor: '3rd Floor, West Wing',
      lat: 12.9720,
      lng: 77.5955,
      manager: 'Prof. Alan Vance',
      phone: '+1 (555) 019-5120',
      hours: '09:00 AM - 07:00 PM',
      icon: 'Cpu',
    },
    {
      id: 'loc-3',
      name: 'Tesla Electronics & IoT Hub',
      code: 'ECE-108',
      building: 'Engineering Block',
      floor: 'Ground Floor, Room 108',
      lat: 12.9710,
      lng: 77.5938,
      manager: 'Dr. Meera Rao',
      phone: '+1 (555) 019-6302',
      hours: '09:00 AM - 06:00 PM',
      icon: 'Zap',
    },
    {
      id: 'loc-4',
      name: 'Edison Maker & Fabrication Lab',
      code: 'MECH-BAY3',
      building: 'Innovation Pavilion',
      floor: 'Workshop Bay 3',
      lat: 12.9728,
      lng: 77.5962,
      manager: 'Er. Suresh Nair',
      phone: '+1 (555) 019-2204',
      hours: '08:30 AM - 05:30 PM',
      icon: 'Wrench',
    },
    {
      id: 'loc-5',
      name: 'Digital Media & HPC Studio',
      code: 'MEDIA-201',
      building: 'Creative Arts Annex',
      floor: 'Floor 2, Studio 201',
      lat: 12.9704,
      lng: 77.5950,
      manager: 'Sarah Jenkins',
      phone: '+1 (555) 019-7890',
      hours: '10:00 AM - 08:00 PM',
      icon: 'Camera',
    },
  ];

  const users = [
    {
      id: 'u-1',
      name: 'Alice Walker',
      email: 'alice@campus.edu',
      password_hash: passwordHash,
      role: 'student',
      department: 'Computer Science',
      student_id: 'CS2024-042',
      phone: '+1 (555) 234-5671',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'u-2',
      name: 'Rahul Sharma',
      email: 'rahul@campus.edu',
      password_hash: passwordHash,
      role: 'student',
      department: 'Electronics & Communication',
      student_id: 'EC2024-118',
      phone: '+1 (555) 345-6782',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2026-09-01T08:30:00Z',
    },
    {
      id: 'u-3',
      name: 'Prof. Alan Vance',
      email: 'vance@campus.edu',
      password_hash: passwordHash,
      role: 'faculty',
      department: 'Computer Science',
      title: 'Associate Professor & Lab In-Charge',
      phone: '+1 (555) 456-7893',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      created_at: '2026-08-15T09:00:00Z',
    },
    {
      id: 'u-4',
      name: 'Dr. Meera Rao',
      email: 'meera@campus.edu',
      password_hash: passwordHash,
      role: 'faculty',
      department: 'Electronics & Communication',
      title: 'Professor & Hardware Lab Director',
      phone: '+1 (555) 567-8904',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      created_at: '2026-08-15T09:30:00Z',
    },
    {
      id: 'u-5',
      name: 'Chief Admin Officer',
      email: 'admin@campus.edu',
      password_hash: adminHash,
      role: 'admin',
      department: 'Central Campus Services',
      title: 'Campus Resource Coordinator',
      phone: '+1 (555) 678-9015',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: '2026-08-01T10:00:00Z',
    },
  ];

  const resources = [
    {
      id: 'res-1',
      title: 'Introduction to Algorithms (CLRS 4th Edition)',
      category: 'Book',
      department: 'Computer Science',
      location_id: 'loc-1',
      room_details: 'Stack 4B, Shelf 12',
      condition: 'Excellent',
      total_quantity: 8,
      available_quantity: 4,
      image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500',
      description: 'Comprehensive standard reference covering sorting, data structures, graph algorithms, and dynamic programming.',
      tags: ['Algorithms', 'Data Structures', 'Textbook', 'Core CS'],
      max_borrow_days: 14,
      owner_id: 'u-5',
      created_at: '2026-09-05T10:00:00Z',
    },
    {
      id: 'res-2',
      title: 'Rigol DS1054Z 50MHz Digital Oscilloscope',
      category: 'Lab Equipment',
      department: 'Electronics & Communication',
      location_id: 'loc-3',
      room_details: 'Workbench Station 3',
      condition: 'Excellent',
      total_quantity: 5,
      available_quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
      description: '4-channel digital storage oscilloscope with 1 GSa/s real-time sample rate, deep memory, and waveform recording.',
      tags: ['Oscilloscope', 'Measurement', 'Hardware Debugging', 'Circuits'],
      max_borrow_days: 7,
      owner_id: 'u-4',
      created_at: '2026-09-06T11:00:00Z',
    },
    {
      id: 'res-3',
      title: 'Raspberry Pi 4 Model B (8GB RAM) Lab Kit',
      category: 'Electronics / IoT Kit',
      department: 'Computer Science',
      location_id: 'loc-2',
      room_details: 'Locker 2C, Kit Box #09',
      condition: 'Good',
      total_quantity: 12,
      available_quantity: 6,
      image_url: 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?w=500',
      description: 'Complete IoT development bundle with 64GB MicroSD, power supply, active cooling fan, and sensor hat expansion.',
      tags: ['IoT', 'Embedded Linux', 'Python', 'Edge Computing'],
      max_borrow_days: 10,
      owner_id: 'u-3',
      created_at: '2026-09-07T12:00:00Z',
    },
    {
      id: 'res-4',
      title: 'Fluke 87V True-RMS Digital Multimeter',
      category: 'Lab Equipment',
      department: 'Electronics & Communication',
      location_id: 'loc-3',
      room_details: 'Tool Cabinet A, Row 2',
      condition: 'Excellent',
      total_quantity: 6,
      available_quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500',
      description: 'High-accuracy industrial multimeter with temperature probe, capacitance, frequency, and duty cycle testing.',
      tags: ['Multimeter', 'Voltage', 'Troubleshooting', 'Calibration'],
      max_borrow_days: 5,
      owner_id: 'u-4',
      created_at: '2026-09-08T13:00:00Z',
    },
    {
      id: 'res-5',
      title: 'Arduino Mega 2560 Advanced Sensor Kit',
      category: 'Electronics / IoT Kit',
      department: 'Electronics & Communication',
      location_id: 'loc-3',
      room_details: 'Storage Bin 14',
      condition: 'Good',
      total_quantity: 10,
      available_quantity: 3,
      image_url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500',
      description: '54 digital I/O pins, 16 analog inputs, including ultrasonic, RFID, gyro, and motor driver shield modules.',
      tags: ['Robotics', 'Microcontroller', 'Sensors', 'Actuators'],
      max_borrow_days: 14,
      owner_id: 'u-4',
      created_at: '2026-09-09T14:00:00Z',
    },
    {
      id: 'res-6',
      title: 'Clean Architecture & Microservices Bundle',
      category: 'Book',
      department: 'Computer Science',
      location_id: 'loc-2',
      room_details: 'CS Reading Corner Shelf 1',
      condition: 'Excellent',
      total_quantity: 4,
      available_quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      description: 'Seminal guide by Robert C. Martin on software structure, domain-driven design, and maintainable enterprise patterns.',
      tags: ['Software Engineering', 'System Design', 'Architecture'],
      max_borrow_days: 21,
      owner_id: 'u-3',
      created_at: '2026-09-10T15:00:00Z',
    },
    {
      id: 'res-7',
      title: 'Prusa i3 MK3S+ High-Precision 3D Printer',
      category: 'Lab Equipment',
      department: 'Mechanical Engineering',
      location_id: 'loc-4',
      room_details: 'Rapid Prototyping Bay Station 1',
      condition: 'Good',
      total_quantity: 3,
      available_quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1631557559445-565434193b2a?w=500',
      description: 'Direct-drive extruder 3D printer for PLA, PETG, and ABS filament prototyping with heated magnetic bed.',
      tags: ['3D Printing', 'CAD Modeling', 'Fabrication', 'Prototyping'],
      max_borrow_days: 3,
      owner_id: 'u-5',
      created_at: '2026-09-11T16:00:00Z',
    },
    {
      id: 'res-8',
      title: 'Sony Alpha a7 III Full-Frame 4K Camera Rig',
      category: 'Computing / Media',
      department: 'Central Campus Services',
      location_id: 'loc-5',
      room_details: 'Media Safe Locker M-04',
      condition: 'Excellent',
      total_quantity: 2,
      available_quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
      description: '24.2MP full-frame sensor, 4K HDR video recording, 28-70mm lens, Rode wireless microphone kit for campus documentaries.',
      tags: ['Videography', 'Photography', 'Audio', 'Media Production'],
      max_borrow_days: 4,
      owner_id: 'u-5',
      created_at: '2026-09-12T09:00:00Z',
    },
    {
      id: 'res-9',
      title: 'Operating Systems & Kernel Dev Master Notes (Prof. Vance)',
      category: 'Project Materials',
      department: 'Computer Science',
      location_id: 'loc-2',
      room_details: 'Digital Repository & Printed Folio #03',
      condition: 'Excellent',
      total_quantity: 15,
      available_quantity: 10,
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
      description: 'Curated semester lecture notes, x86 assembly examples, thread scheduling diagrams, and memory management problem sets.',
      tags: ['Operating Systems', 'Notes', 'Kernel', 'C Programming'],
      max_borrow_days: 30,
      owner_id: 'u-3',
      created_at: '2026-09-13T10:30:00Z',
    },
    {
      id: 'res-10',
      title: 'NVIDIA Jetson Nano AI Developer Board (4GB)',
      category: 'Electronics / IoT Kit',
      department: 'Computer Science',
      location_id: 'loc-2',
      room_details: 'AI Robotics Cabinet, Box 4',
      condition: 'Excellent',
      total_quantity: 4,
      available_quantity: 0,
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500',
      description: '128-core Maxwell GPU computing board for real-time computer vision, edge deep learning, and autonomous robotics.',
      tags: ['AI', 'Computer Vision', 'Deep Learning', 'GPU'],
      max_borrow_days: 14,
      owner_id: 'u-3',
      created_at: '2026-09-14T11:00:00Z',
    },
  ];

  const requests = [
    {
      id: 'req-1',
      resource_id: 'res-3',
      resource_title: 'Raspberry Pi 4 Model B (8GB RAM) Lab Kit',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      user_email: 'alice@campus.edu',
      user_role: 'student',
      user_department: 'Computer Science',
      purpose: 'Developing real-time air quality sensor gateway for Environmental CS project.',
      duration_days: 7,
      status: 'approved',
      faculty_reviewer_id: 'u-3',
      faculty_name: 'Prof. Alan Vance',
      remarks: 'Approved. Please pick up from CS-304 locker 2C by Friday.',
      start_date: '2026-10-12T00:00:00Z',
      due_date: '2026-10-19T23:59:59Z',
      return_date: null,
      created_at: '2026-10-11T14:20:00Z',
    },
    {
      id: 'req-2',
      resource_id: 'res-1',
      resource_title: 'Introduction to Algorithms (CLRS 4th Edition)',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      user_email: 'alice@campus.edu',
      user_role: 'student',
      user_department: 'Computer Science',
      purpose: 'Preparing for competitive programming contest and algorithm design midterm.',
      duration_days: 14,
      status: 'issued',
      faculty_reviewer_id: 'u-3',
      faculty_name: 'Prof. Alan Vance',
      remarks: 'Issued at Library circulation desk.',
      start_date: '2026-10-05T10:00:00Z',
      due_date: '2026-10-19T18:00:00Z',
      return_date: null,
      created_at: '2026-10-04T09:15:00Z',
    },
    {
      id: 'req-3',
      resource_id: 'res-4',
      resource_title: 'Fluke 87V True-RMS Digital Multimeter',
      user_id: 'u-2',
      user_name: 'Rahul Sharma',
      user_email: 'rahul@campus.edu',
      user_role: 'student',
      user_department: 'Electronics & Communication',
      purpose: 'Testing power inverter PCB ripple voltage and thermal stability.',
      duration_days: 4,
      status: 'overdue',
      faculty_reviewer_id: 'u-4',
      faculty_name: 'Dr. Meera Rao',
      remarks: 'Overdue! Due date was 2 days ago. Please return immediately.',
      start_date: '2026-10-06T11:00:00Z',
      due_date: '2026-10-10T17:00:00Z',
      return_date: null,
      created_at: '2026-10-05T15:30:00Z',
    },
    {
      id: 'req-4',
      resource_id: 'res-5',
      resource_title: 'Arduino Mega 2560 Advanced Sensor Kit',
      user_id: 'u-2',
      user_name: 'Rahul Sharma',
      user_email: 'rahul@campus.edu',
      user_role: 'student',
      user_department: 'Electronics & Communication',
      purpose: 'Building autonomous line follower and obstacle avoidance rover robot.',
      duration_days: 10,
      status: 'pending',
      faculty_reviewer_id: null,
      faculty_name: null,
      remarks: null,
      start_date: null,
      due_date: null,
      return_date: null,
      created_at: '2026-10-14T09:10:00Z',
    },
    {
      id: 'req-5',
      resource_id: 'res-6',
      resource_title: 'Clean Architecture & Microservices Bundle',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      user_email: 'alice@campus.edu',
      user_role: 'student',
      user_department: 'Computer Science',
      purpose: 'Reference study for software engineering term paper.',
      duration_days: 7,
      status: 'returned',
      faculty_reviewer_id: 'u-3',
      faculty_name: 'Prof. Alan Vance',
      remarks: 'Returned in pristine condition.',
      start_date: '2026-09-20T10:00:00Z',
      due_date: '2026-09-27T18:00:00Z',
      return_date: '2026-09-26T16:45:00Z',
      created_at: '2026-09-19T11:00:00Z',
    },
  ];

  const transactions = [
    {
      id: 'txn-1',
      request_id: 'req-5',
      resource_id: 'res-6',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      action: 'RETURNED',
      timestamp: '2026-09-26T16:45:00Z',
      note: 'Returned to Prof. Vance. Condition verified: Excellent.',
    },
    {
      id: 'txn-2',
      request_id: 'req-2',
      resource_id: 'res-1',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      action: 'ISSUED',
      timestamp: '2026-10-05T10:00:00Z',
      note: 'Physical check-out completed at Central Library.',
    },
    {
      id: 'txn-3',
      request_id: 'req-3',
      resource_id: 'res-4',
      user_id: 'u-2',
      user_name: 'Rahul Sharma',
      action: 'OVERDUE_FLAGGED',
      timestamp: '2026-10-11T00:01:00Z',
      note: 'Automated deadline monitor flagged item overdue. SMS reminder queued.',
    },
    {
      id: 'txn-4',
      request_id: 'req-1',
      resource_id: 'res-3',
      user_id: 'u-1',
      user_name: 'Alice Walker',
      action: 'APPROVED',
      timestamp: '2026-10-12T09:00:00Z',
      note: 'Faculty approval granted by Prof. Alan Vance.',
    },
    {
      id: 'txn-5',
      request_id: 'req-4',
      resource_id: 'res-5',
      user_id: 'u-2',
      user_name: 'Rahul Sharma',
      action: 'REQUESTED',
      timestamp: '2026-10-14T09:10:00Z',
      note: 'Borrow request submitted for Arduino Mega Sensor Kit.',
    },
  ];

  const notifications = [
    {
      id: 'notif-1',
      user_id: 'u-1',
      type: 'APPROVAL',
      title: 'Request Approved!',
      message: 'Prof. Alan Vance approved your request for Raspberry Pi 4 Model B Lab Kit. Ready for collection.',
      channel: 'EMAIL',
      status: 'unread',
      created_at: '2026-10-12T09:02:00Z',
    },
    {
      id: 'notif-2',
      user_id: 'u-1',
      type: 'DUE_SOON',
      title: 'Due Date Reminder',
      message: 'Your loan for "Introduction to Algorithms" is due on Oct 19, 2026 (in 4 days).',
      channel: 'SMS',
      status: 'unread',
      created_at: '2026-10-15T08:00:00Z',
    },
    {
      id: 'notif-3',
      user_id: 'u-2',
      type: 'OVERDUE',
      title: 'URGENT: Overdue Item',
      message: 'Fluke 87V Digital Multimeter is overdue by 4 days. Please return it immediately to avoid penalties.',
      channel: 'SMS',
      status: 'unread',
      created_at: '2026-10-11T09:00:00Z',
    },
    {
      id: 'notif-4',
      user_id: 'u-3',
      type: 'NEW_REQUEST',
      title: 'New Student Request',
      message: 'Rahul Sharma submitted a request for Arduino Mega 2560 Advanced Sensor Kit awaiting your review.',
      channel: 'IN_APP',
      status: 'unread',
      created_at: '2026-10-14T09:11:00Z',
    },
  ];

  const logs = [
    {
      id: 'log-1',
      timestamp: '2026-10-14T09:10:00Z',
      actor_name: 'Rahul Sharma (Student)',
      actor_role: 'student',
      action: 'CREATE_REQUEST',
      target: 'Arduino Mega 2560 Advanced Sensor Kit',
      details: 'Requested for 10 days for line-following rover project.',
    },
    {
      id: 'log-2',
      timestamp: '2026-10-12T09:00:00Z',
      actor_name: 'Prof. Alan Vance (Faculty)',
      actor_role: 'faculty',
      action: 'APPROVE_REQUEST',
      target: 'Raspberry Pi 4 Model B Lab Kit',
      details: 'Approved for Alice Walker. Pickup slot scheduled.',
    },
    {
      id: 'log-3',
      timestamp: '2026-10-11T00:01:00Z',
      actor_name: 'System Daemon',
      actor_role: 'system',
      action: 'DEADLINE_CHECK',
      target: 'Fluke 87V Multimeter',
      details: 'Marked request req-3 status to OVERDUE.',
    },
    {
      id: 'log-4',
      timestamp: '2026-10-05T10:00:00Z',
      actor_name: 'Dr. K. Ramesh (Library In-Charge)',
      actor_role: 'faculty',
      action: 'ISSUE_RESOURCE',
      target: 'Introduction to Algorithms (CLRS)',
      details: 'Handed over copy #3 to Alice Walker.',
    },
  ];

  return {
    locations,
    users,
    resources,
    requests,
    transactions,
    notifications,
    logs,
  };
}

// Database helper with atomic sync write
class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      this.data = initial;
    } else {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading data file, reinitializing:', err);
        const initial = getInitialData();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        this.data = initial;
      }
    }
  }

  save() {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  }

  // Generic helpers
  getTable(tableName) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    return this.data[tableName];
  }

  find(tableName, filterFn) {
    const table = this.getTable(tableName);
    return filterFn ? table.filter(filterFn) : [...table];
  }

  findOne(tableName, filterFn) {
    const table = this.getTable(tableName);
    return table.find(filterFn) || null;
  }

  findById(tableName, id) {
    return this.findOne(tableName, (item) => item.id === id);
  }

  insert(tableName, item) {
    const table = this.getTable(tableName);
    table.unshift(item);
    this.save();
    return item;
  }

  update(tableName, id, updates) {
    const table = this.getTable(tableName);
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) return null;
    table[index] = { ...table[index], ...updates };
    this.save();
    return table[index];
  }

  delete(tableName, id) {
    const table = this.getTable(tableName);
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) return false;
    table.splice(index, 1);
    this.save();
    return true;
  }

  logActivity(actor, action, target, details) {
    const logEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor_name: actor.name || 'System',
      actor_role: actor.role || 'system',
      action,
      target,
      details,
    };
    this.insert('logs', logEntry);
    return logEntry;
  }

  reset() {
    const initial = getInitialData();
    this.data = initial;
    this.save();
    return initial;
  }
}

export const db = new Database();
