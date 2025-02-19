import MongoConnection from "./MongoConnection.js";
const {
  MONGO_CONNECTION,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  DB_NAME,
  COURSES_COLLECTION,
  ACCOUNTS_COLLECTION,
} = process.env;
const connectionString = `${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionString, DB_NAME);
const accounts = mongoConnection.getCollection(ACCOUNTS_COLLECTION);
const courses = mongoConnection.getCollection(COURSES_COLLECTION);
const courseObjects = {
  J101: { id: "J101", name: "Front-End", lecturer: "Vasya", hours: 200 },
  J102: { id: "J102", name: "JAVA", lecturer: "Vasya", hours: 300 },
  J103: { id: "J103", name: "Back-End", lecturer: "Olya", hours: 350 },
  J104: { id: "J104", name: "Node", lecturer: "Olya", hours: 150 },
  J105: { id: "J105", name: "AWS", lecturer: "Vova", hours: 200 },
  J106: { id: "J106", name: "C++", lecturer: "Vova", hours: 500 },
};
async function insertCourses() {
  try {
    for  (const course of Object.values(courseObjects)) {
      await courses.insertOne(toDbCourse(course));

    }
    console.log("courses inserted");
  } catch (error) {
     console.log(error);
  } finally {
     mongoConnection.close();
  }
}

function toDbCourse(course) {
  const { name, lecturer, hours, id } = course;
  return { _id: id, name, lecturer, hours };
}
// insertCourses();
async function findCourse(courseId) {
    const course = await courses.findOne({_id:courseId})
    if(!course) {
        throw Error(`course ${courseId} not found`);
    }
    return course;
}
//findCourse("J11").then((course) => console.log(course)).catch(e => console.log(e.message)).finally(()=>mongoConnection.close());
async function findFilteredCourses(filter) {
    const coursesRes = await courses.find(filter).toArray();
    return coursesRes
}
//findFilteredCourses({lecturer: "Vasya", hours:200}).then((course) => console.log(course)).catch(e => console.log(e.message)).finally(()=>mongoConnection.close()) 
async function updateCourse(courseId, updaterObj) {
    const course = await courses.findOneAndUpdate({_id:courseId}, {$set:updaterObj}, {returnDocument: "after"});
    return course;
}
// const course = await updateCourse("J101",{hours:400});
async function deleteCourse(courseId) { 
    const res = await courses.findOneAndDelete({_id:courseId});
    if(!res) {
        throw Error(`course ${courseId} not found`)
    }
    return res;
    
}

deleteCourse("J101").then(res => console.log(res)).catch(e => console.log(e.message)).finally(()=>mongoConnection.close())
