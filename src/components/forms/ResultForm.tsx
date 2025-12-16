"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any; // e.g., students, exams, assignments
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data || {
      score: 0,
      examId: null,
      assignmentId: null,
      studentId: "",
    },
  });

  // useFormState wraps server action
  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });
  // console.log(relatedData);
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Result" : "Update Result"}
      </h1>
      <InputField
        label="Score"
        name="score"
        type="number"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        defaultValue={data?.score || 0}
        error={errors.score}
      />
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Student</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("studentId")}
          defaultValue={data?.studentId || ""}
        >
          {relatedData?.students?.map((student: any) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname}
            </option>
          ))}
        </select>
        {errors.studentId?.message && (
          <p className="text-xs text-red-400">{errors.studentId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Exam (optional)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("examId", { valueAsNumber: true })}
          defaultValue={data?.examId || ""}
        >
          <option value="">None</option>
          {relatedData?.exams?.map((exam: any) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
        {errors.examId?.message && (
          <p className="text-xs text-red-400">{errors.examId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Assignment (optional)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("assignmentId", { valueAsNumber: true })}
          defaultValue={data?.assignmentId || ""}
        >
          <option value="">None</option>
          {relatedData?.assignments?.map((assignment: any) => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.title}
            </option>
          ))}
        </select>
        {errors.assignmentId?.message && (
          <p className="text-xs text-red-400">{errors.assignmentId.message}</p>
        )}
      </div>

      {data && <input type="hidden" name="id" value={data?.id} />}

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
