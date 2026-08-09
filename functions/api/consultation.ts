import {
  handleFormSubmission,
  type Env,
} from "../_lib/forms";

export const onRequestPost:
  PagesFunction<Env> = async ({
    request,
    env,
  }) => {
    return handleFormSubmission(
      request,
      env,
      "consultation",
    );
  };