Government Bus Tracking and Passenger Journey Assistance System
A centralized platform for bus search, route and timetable information,
simulated bus tracking, estimated arrival time (ETA), and alternative
bus suggestions.
> **Project note:** GPS tracking is simulated, not actual MSRTC live
> vehicle tracking. This project is not officially affiliated with
> MSRTC. Missing bus information, fares, timings, or seat availability
> will not be fabricated.
Table of Contents
Project Overview
Problem Statement
Objectives
Scope and Limitations
Technology Stack
System Architecture
Project Modules
Database Design
Team Responsibilities
Development Timeline
GitHub Collaboration
Testing Strategy
Risk Management
Deliverables
Expected Outcome
1. Project Overview
The Government Bus Tracking and Passenger Journey Assistance System
helps passengers search for buses, check journey information, track
simulated bus locations, view ETA, and find alternative buses.
The system includes a Passenger Web Application, Passenger Android
Application, Admin Panel, common Backend/API Server, MongoDB Database,
and Simulated GPS module.
2. Problem Statement
Passengers often face difficulties finding bus information, checking
schedules, understanding routes, and planning journeys. This project
aims to provide a centralized digital platform where passengers can
access available bus journey information and receive journey assistance.
3. Project Objectives
Provide a user-friendly bus search platform.
Display available bus routes and stops.
Provide timetable information.
Provide simulated GPS-based bus tracking.
Display ETA when sufficient journey duration data is available.
Suggest alternative bus options when available.
Provide passenger registration and login.
Provide passenger profile and feedback facilities.
Develop a responsive web application.
Develop an Android mobile application.
Provide an Admin Panel for system management.
4. Project Scope and Limitations
Included in the Project
Passenger Web Application and Passenger Android Application
Admin Panel
Bus Search and Bus Details
Route, Stop, and Timetable Information
Simulated GPS Tracking and ETA Calculation
Alternative Bus Information
User Authentication and Passenger Profile
Notifications and Feedback Management
MongoDB Database Management
Limitations
GPS tracking is simulated, not actual MSRTC live vehicle tracking.
The GTFS dataset is community-sourced and may be incomplete.
The project is not officially affiliated with MSRTC.
Missing bus information, fares, timings, or seat availability will
not be fabricated.
ETA will be displayed only when sufficient journey duration data is
available.
5. Technology Stack
Component           Technology
---
Passenger Web       React.js
Passenger Mobile    Flutter (Android)
Admin Panel         React.js
Backend             Node.js
API Framework       Express.js
Database            MongoDB
API Communication   REST API
Development Tools   VS Code, Antigravity
Version Control     Git and GitHub
Database Tool       MongoDB Compass
6. System Architecture
The project follows a three-layer architecture.
Architecture Diagram
``` mermaid
flowchart TB
    subgraph P["Presentation Layer"]
        WEB["Passenger Web App<br/>React.js"]
        MOBILE["Passenger Mobile App<br/>Flutter"]
        ADMIN["Admin Panel<br/>React.js"]
        GPS["Simulated GPS<br/>Demo Coordinates"]
    end
    API["Backend / API Server<br/>Node.js + Express.js<br/>REST APIs"]
    DB[("MongoDB Database<br/>11 Collections")]
    WEB <-->|REST API| API
    MOBILE <-->|REST API| API
    ADMIN <-->|REST API| API
    GPS -->|Simulated coordinates| API
    API <-->|Read / Write| DB
```
Architecture Layers
Presentation Layer - Passenger Web Application - Passenger Mobile
Application - Admin Panel
Application Layer - Node.js and Express.js - REST APIs and
Authentication - Bus Search - GPS Tracking - ETA Calculation -
Alternative Bus Logic
Database Layer - MongoDB - 11 Collections - Data Relationships -
Database Validation
Working Flow
Passenger opens the Web or Mobile Application.
Passenger searches for a bus or selects a journey.
The frontend sends a request to the Backend/API Server.
The backend retrieves required information from MongoDB.
The Simulated GPS module provides demo bus coordinates.
The backend calculates ETA only when sufficient journey-duration
data is available.
The application displays bus information, location, next stop, and
ETA where supported.
The Admin Panel uses common backend APIs to manage system
information.
7. Main Project Modules
A. Passenger Web Application
Registration and Login
Passenger Dashboard
Bus Search and Bus Details
Route and Stop Details
Timetable
Bus Tracking and ETA
Alternative Bus Search
Passenger Profile
Notifications and Feedback
B. Passenger Mobile Application
Splash Screen
Login and Registration
Passenger Home
Bus Search and Bus Details
Route and Timetable
Simulated Bus Tracking and ETA
Alternative Bus
Profile, Notifications, and Feedback
C. Admin Panel
Admin Login and Dashboard
Bus Management
Route and Stop Management
Timetable Management
User Management
Feedback Management
Notification Management
D. Backend Module
Express Server and REST API Development
Authentication
Bus Search APIs
Route and Stop APIs
Timetable APIs
GPS Tracking APIs
ETA Calculation
Alternative Bus Logic
Profile and Feedback APIs
8. Database Design
MongoDB is planned to contain these 11 collections:
    No. Collection      Purpose
---
      1 Users           Passenger and user information
      2 Drivers         Driver information
      3 Buses           Bus details
      4 Routes          Route information
      5 Stops           Bus stop information
      6 Trips           Trip information
      7 GPSLocations    Simulated GPS location records
      8 Timetables      Bus timetable information
      9 Breakdowns      Bus breakdown information
     10 Notifications   Passenger notifications
     11 Feedbacks       Passenger feedback

Actual fields, references, and validation rules will be defined in the
database models.
9. Team Member Responsibilities
Member 1 -- Team Leader: Architecture & Integration
Responsibilities: Project Planning, System Architecture,
Architecture Diagrams, Data Flow Diagrams, Working Flow Documentation,
GitHub Repository Management, Team Coordination, Frontend and Backend
Integration, and Final Integration Testing.
Assigned files/folders: `README.md`, `docs/`, `.gitignore`, and
root-level configuration files.
Member 2 -- Frontend Developer
Responsibilities: Passenger Web Application, Flutter Android
Application, Admin Panel UI, Responsive Design, and Frontend API
Integration.
Assigned folders: `passenger-web/`, `passenger-mobile/`,
`admin-panel/`.
Member 3 -- Database Developer
Responsibilities: MongoDB Configuration, 11 Database Models, Schema
Design, Relationships, Data Validation, GTFS Data Migration, and Demo
Data Management.
Assigned files/folders: `backend/src/config/`,
`backend/src/models/`, `backend/scripts/`, `docs/datasets/msrtc-gtfs/`.
Member 4 -- Backend Developer
Responsibilities: Node.js and Express.js, REST API Development,
Authentication, Bus Search APIs, GPS Tracking, ETA Calculation,
Alternative Bus Logic, and Backend Services.
Assigned files/folders: `backend/src/app.js`,
`backend/src/server.js`, `backend/src/controllers/`,
`backend/src/routes/`, `backend/src/middlewares/`,
`backend/src/services/`, `backend/src/utils/`, `backend/src/data/`.
Common Responsibilities
All members will participate in Module Testing, Integration Testing,
Test Case Preparation, Project Documentation Review, Final Presentation,
Project Demonstration, and Viva Preparation.
10. Project Development Timeline
Phase      Planned Work
---
Phase 1    Requirement Analysis and Project Planning
Phase 2    System Architecture and Database Design
Phase 3    Backend Development and API Testing
Phase 4    Database Implementation and Data Migration
Phase 5    Passenger Web Application
Phase 6    Flutter Android Application
Phase 7    Admin Panel Development
Phase 8    Frontend and Backend Integration
Phase 9    System Testing and Bug Fixing
Phase 10   Documentation, PPT, and Final Demonstration
Phases will be completed progressively, with coordination between team
members.
11. GitHub Collaboration Plan
Create one common GitHub repository.
Add all team members as collaborators.
Each member works on assigned files using an individual GitHub
account.
Each member creates a separate feature branch.
Commit and push individual changes.
Create Pull Requests for code review.
Merge verified changes into the main branch.
Maintain meaningful commit messages.
Files Not to Be Committed
`.env`
`node_modules/`
Generated `dist/` and `build/` folders
Local credentials and passwords
12. Testing Strategy
Unit Testing - Test individual frontend components. - Test backend
API functions. - Test database models and validation.
Integration Testing - Test frontend and backend communication. -
Test backend and database communication. - Verify authentication and
data flow.
System Testing - Test the complete passenger journey. - Test bus
search and details. - Test timetable and simulated tracking. - Test ETA
and alternative bus information. - Test passenger profile and feedback.
Compatibility Testing - Test Passenger Web on different screen
sizes. - Test Flutter application on Android devices. - Test Admin Panel
on supported browsers.
13. Risk Management
Risk                          Planned Solution
---
Incomplete GTFS Data          Display unavailable data clearly
Backend API Errors            API testing and error handling
Database Connection Failure   Check MongoDB connection
Integration Conflicts         Branch-based GitHub workflow
Simulated GPS Limitations     Clearly identify simulated tracking
Missing Journey Durations     Do not generate unsupported ETA
Device Compatibility Issues   Test on Android devices
14. Expected Project Deliverables
Complete Project Source Code
Passenger Web Application
Passenger Android Application
Admin Panel
Node.js Backend APIs
MongoDB Database with 11 Collections
System Architecture Diagram
Data Flow Diagram
Project Planning Document
Test Cases and Testing Report
Project Report
Presentation PPT
GitHub Repository
Final Project Demonstration
15. Expected Outcome
The expected outcome is a centralized Government Bus Tracking and
Passenger Journey Assistance System that provides convenient access to
available bus information, journey planning assistance, simulated
tracking, and estimated arrival information through web and Android
applications.
The project will demonstrate frontend development, backend API
integration, database management, software architecture, teamwork, and
software testing.
