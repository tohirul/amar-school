"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ExamType } from "@prisma/client";

interface ExamFormProps {
  type: "create" | "update";
  data?: Partial<ExamSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    periods?: { id: number; name: string }[];
    classes?: { id: number; name: string }[];
    subjects?: { id: number; name: string }[];
    exams?: { id: number; title: string }[];
  };
}

const ExamForm = ({ type, data, setOpen, relatedData }: ExamFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Exam ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, type, setOpen]);

  const examType = watch("type");
  const {
    periods = [],
    classes = [],
    subjects = [],
    exams = [],
  } = relatedData || {};

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit((formData) => formAction(formData))}
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Exam" : "Update Exam"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Exam Title"
          name="title"
          register={register}
          error={errors.title}
        />
        <InputField
          label="Start Date"
          type="datetime-local"
          name="startTime"
          register={register}
          error={errors.startTime}
        />
        <InputField
          label="End Date"
          type="datetime-local"
          name="endTime"
          register={register}
          error={errors.endTime}
        />

        {/* Exam Type Selector */}
        <div className="flex flex-col gap-1 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Exam Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
          >
            {Object.values(ExamType).map((t) => (
              <option value={t} key={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Conditional Fields */}
        {examType === ExamType.CLASS_TEST && (
          <>
            <div className="flex flex-col gap-1 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Period</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("periodId", { valueAsNumber: true })}
              >
                {periods.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.periodId && (
                <p className="text-xs text-red-500">
                  {errors.periodId.message}
                </p>
              )}
            </div>
          </>
        )}

        {(examType === ExamType.MID_TERM ||
          examType === ExamType.TERM_FINAL ||
          examType === ExamType.RETAKE) && (
          <>
            <div className="flex flex-col gap-1 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Class</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("classId", { valueAsNumber: true })}
              >
                {classes.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="text-xs text-red-500">{errors.classId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Subject</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("subjectId", { valueAsNumber: true })}
              >
                {subjects.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="text-xs text-red-500">
                  {errors.subjectId.message}
                </p>
              )}
            </div>
          </>
        )}

        {examType === ExamType.RETAKE && (
          <div className="flex flex-col gap-1 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Original Exam</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("originalExamId", { valueAsNumber: true })}
            >
              {exams.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            {errors.originalExamId && (
              <p className="text-xs text-red-500">
                {errors.originalExamId.message}
              </p>
            )}
          </div>
        )}
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-500 text-white p-2 rounded-md w-full md:w-1/4">
        {type === "create" ? "Create Exam" : "Update Exam"}
      </button>
    </form>
  );
};

export default ExamForm;
