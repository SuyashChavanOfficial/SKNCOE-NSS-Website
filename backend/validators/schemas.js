import * as yup from "yup";
import { MESSAGES } from "../constants/messages.js";

export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .required(MESSAGES.VALIDATION.FULL_NAME_REQUIRED)
    .min(2, "Name must be at least 2 characters")
    .max(50),
  username: yup
    .string()
    .required("Username is required")
    .min(3, MESSAGES.VALIDATION.USERNAME_SHORT)
    .max(50),
  email: yup
    .string()
    .email(MESSAGES.VALIDATION.INVALID_EMAIL)
    .required("Email is required"),
  password: yup
    .string()
    .min(8, MESSAGES.VALIDATION.PASSWORD_SHORT)
    .required("Password is required"),
});

export const signinSchema = yup.object().shape({
  email: yup
    .string()
    .email(MESSAGES.VALIDATION.INVALID_EMAIL)
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required"),
});

export const createVolunteerSchema = yup.object().shape({
  name: yup.string().required(MESSAGES.VALIDATION.FULL_NAME_REQUIRED),
  email: yup
    .string()
    .email(MESSAGES.VALIDATION.INVALID_EMAIL)
    .required("Email is required"),
  password: yup
    .string()
    .min(8, MESSAGES.VALIDATION.PASSWORD_SHORT)
    .required("Password is required"),
  nssID: yup.string().required(MESSAGES.VALIDATION.NSS_ID_REQUIRED),
  batch: yup.string().required(MESSAGES.VALIDATION.BATCH_REQUIRED),
  dob: yup.date().nullable().notRequired(),
  profilePicture: yup.string().notRequired(),
  profilePictureId: yup.string().nullable().notRequired(),
  prnNumber: yup.string().nullable().notRequired(),
  eligibilityNumber: yup.number().nullable().notRequired(),
  rollNumber: yup.string().nullable().notRequired(),
});

export const updateVolunteerSchema = yup.object().shape({
  userId: yup.string().required("User ID is required"),
  name: yup.string().notRequired(),
  username: yup.string().notRequired(),
  email: yup.string().email(MESSAGES.VALIDATION.INVALID_EMAIL).notRequired(),
  password: yup.string().min(8, MESSAGES.VALIDATION.PASSWORD_SHORT).nullable().notRequired(),
  nssID: yup.string().notRequired(),
  batch: yup.string().notRequired(),
  dob: yup.date().nullable().notRequired(),
  profilePicture: yup.string().notRequired(),
  profilePictureId: yup.string().nullable().notRequired(),
  prnNumber: yup.string().nullable().notRequired(),
  eligibilityNumber: yup.number().nullable().notRequired(),
  rollNumber: yup.string().nullable().notRequired(),
  status: yup.string().notRequired(),
});

export const createPostSchema = yup.object().shape({
  title: yup.string().required(MESSAGES.VALIDATION.TITLE_REQUIRED),
  content: yup.string().required(MESSAGES.VALIDATION.CONTENT_REQUIRED),
  image: yup.string().required(MESSAGES.VALIDATION.IMAGE_REQUIRED),
  imageId: yup.string().nullable().notRequired(),
  newsDate: yup.date().required(MESSAGES.VALIDATION.NEWS_DATE_REQUIRED),
  academicYear: yup.string().required(MESSAGES.VALIDATION.ACADEMIC_YEAR_REQUIRED),
  category: yup.string().notRequired(),
});

export const updatePostSchema = yup.object().shape({
  postId: yup.string().required("Post ID is required"),
  userId: yup.string().required("User ID is required"),
  title: yup.string().notRequired(),
  content: yup.string().notRequired(),
  image: yup.string().notRequired(),
  imageId: yup.string().nullable().notRequired(),
  newsDate: yup.date().notRequired(),
  academicYear: yup.string().notRequired(),
  category: yup.string().notRequired(),
  deleteOldImageId: yup.string().nullable().notRequired(),
});

export const createActivitySchema = yup.object().shape({
  title: yup.string().required(MESSAGES.VALIDATION.TITLE_REQUIRED),
  poster: yup.string().required(MESSAGES.VALIDATION.POSTER_REQUIRED),
  posterId: yup.string().nullable().notRequired(),
  startDate: yup.date().required(MESSAGES.VALIDATION.START_DATE_REQUIRED),
  expectedDurationHours: yup
    .number()
    .required(MESSAGES.VALIDATION.DURATION_REQUIRED),
  description: yup.string().notRequired(),
});

export const updateActivitySchema = yup.object().shape({
  activityId: yup.string().required("Activity ID is required"),
  title: yup.string().notRequired(),
  poster: yup.string().notRequired(),
  posterId: yup.string().nullable().notRequired(),
  startDate: yup.date().notRequired(),
  expectedDurationHours: yup.number().notRequired(),
  description: yup.string().notRequired(),
  linkedPost: yup.string().nullable().notRequired(),
});

export const categorySchema = yup.object().shape({
  name: yup.string().required(MESSAGES.VALIDATION.TITLE_REQUIRED),
});

export const commentSchema = yup.object().shape({
  content: yup.string().required(MESSAGES.COMMENT.EMPTY),
  postId: yup.string().required("Post ID is required"),
});

export const posterSchema = yup.object().shape({
  media: yup.string().required(MESSAGES.VALIDATION.MEDIA_REQUIRED),
  mediaId: yup.string().nullable().notRequired(),
  mediaType: yup.string().notRequired(),
  caption: yup.string().required(MESSAGES.VALIDATION.CAPTION_REQUIRED),
  date: yup.date().notRequired(),
});

export const deleteUserSchema = yup.object().shape({
  userId: yup.string().required("User ID is required"),
});

export const deletePostSchema = yup.object().shape({
  postId: yup.string().required("Post ID is required"),
  userId: yup.string().required("User ID is required"),
});

export const likePostSchema = yup.object().shape({
  postId: yup.string().required("Post ID is required"),
});

export const deleteActivitySchema = yup.object().shape({
  activityId: yup.string().required("Activity ID is required"),
});

export const toggleInterestSchema = yup.object().shape({
  activityId: yup.string().required("Activity ID is required"),
});

export const linkNewsSchema = yup.object().shape({
  activityId: yup.string().required("Activity ID is required"),
  newsId: yup.string().required("News ID is required"),
});

export const likeCommentSchema = yup.object().shape({
  commentId: yup.string().required("Comment ID is required"),
});

export const editCommentSchema = yup.object().shape({
  commentId: yup.string().required("Comment ID is required"),
  content: yup.string().required(MESSAGES.COMMENT.EMPTY),
});

export const deleteCommentSchema = yup.object().shape({
  commentId: yup.string().required("Comment ID is required"),
});

export const deleteCategorySchema = yup.object().shape({
  id: yup.string().required("Category ID is required"),
});

export const updatePosterSchema = yup.object().shape({
  posterId: yup.string().required("Poster ID is required"),
  media: yup.string().notRequired(),
  mediaId: yup.string().nullable().notRequired(),
  mediaType: yup.string().notRequired(),
  caption: yup.string().notRequired(),
  date: yup.date().notRequired(),
});

export const deletePosterSchema = yup.object().shape({
  posterId: yup.string().required("Poster ID is required"),
});

export const deleteUploadSchema = yup.object().shape({
  key: yup.string().required("File key is required"),
});

