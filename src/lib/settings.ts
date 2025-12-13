export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["super_admin", "admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/teachers": ["super_admin", "admin", "teacher"],
  "/list/students": ["super_admin", "admin", "teacher"],
  "/list/parents": ["super_admin", "admin", "teacher"],
  "/list/subjects": ["super_admin", "admin"],
  "/list/classes": ["super_admin", "admin", "teacher"],
  "/list/exams": ["super_admin", "admin", "teacher", "student", "parent"],
  "/list/assignments": ["super_admin", "admin", "teacher", "student", "parent"],
  "/list/results": ["super_admin", "admin", "teacher", "student", "parent"],
  "/list/attendance": ["super_admin", "admin", "teacher", "student", "parent"],
  "/list/events": ["super_admin", "admin", "teacher", "student", "parent"],
  "/list/announcements": [
    "super_admin",
    "admin",
    "teacher",
    "student",
    "parent",
  ],
};
