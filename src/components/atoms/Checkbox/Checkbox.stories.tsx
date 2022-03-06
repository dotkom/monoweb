import { useState } from "react";
import { useForm } from "react-hook-form";
import Checkbox from "./Checkbox";

export default {
  title: "atoms/Checkbox",
  component: Checkbox,
};

export const Form = () => {
  const { register } = useForm();

  return (
    <form>
      <Checkbox {...register("is_happy")} />
    </form>
  );
};
