import groq from 'groq';

export const siteSettingsQuery = groq`*[_type=="siteSettings"][0]`;
export const homeQuery = groq`{
  "settings": *[_type=="siteSettings"][0],
  "upcomingEvents": *[_type=="event" && dateTime(date) > now()] | order(date asc)[0...3]{
    _id,title,slug,date,eventType,danceStyle,coverImage
  }
}`;

export const eventsQuery = groq`*[_type=="event"] | order(date asc){
  _id,title,slug,description,date,eventType,danceStyle,coverImage,registrationLink,
  location->{name,address,mapsUrl},teachers[]->{_id,name,slug,photo}
}`;

export const eventBySlugQuery = groq`*[_type=="event" && slug.current==$slug][0]{
  _id,title,slug,description,date,eventType,danceStyle,coverImage,registrationLink,
  location->{name,address,mapsUrl,coordinates},teachers[]->{_id,name,slug,photo,bio,dancesTaught}
}`;

export const coursesQuery = groq`*[_type=="course"] | order(weekday asc,time asc){
  _id,name,danceStyle,level,weekday,time,duration,capacity,waitingListEnabled,registrationLink,
  teacher->{_id,name,slug,photo}
}`;

export const teachersQuery = groq`*[_type=="teacher"] | order(name asc){
  _id,name,slug,photo,bio,dancesTaught,socialLinks
}`;

export const syllabusQuery = groq`*[_type=="syllabusLevel"] | order(order asc){
  _id,level,description,skills,videos
}`;

export const blogQuery = groq`*[_type=="blogPost"] | order(_createdAt desc){
  _id,title,slug,coverImage,content,tags,author->{name}
}`;

export const blogBySlugQuery = groq`*[_type=="blogPost" && slug.current==$slug][0]{
  _id,title,slug,coverImage,content,tags,author->{name}
}`;

export const galleryQuery = groq`*[_type=="gallery"] | order(_createdAt desc){
  _id,title,images,photographerCredit,event->{title,slug}
}`;

export const communityQuery = groq`*[_type=="siteSettings"][0]{
  communitySections
}`;
