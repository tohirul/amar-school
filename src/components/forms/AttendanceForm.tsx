"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    students: any[];
    periods: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Attendance ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Attendance" : "Update Attendance"}
      </h1>

      <InputField
        label="Date"
        name="date"
        type="date"
        defaultValue={data?.date?.toISOString().split("T")[0]}
        register={register}
        error={errors.date}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Student</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("studentId")}
          defaultValue={data?.studentId}
        >
          {relatedData?.students?.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname}
            </option>
          ))}
        </select>
        {errors.studentId?.message && (
          <p className="text-xs text-red-400">
            {errors.studentId.message.toString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Period</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("periodId")}
          defaultValue={data?.periodId}
        >
          {relatedData?.periods?.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name} – {period.class.name} – {period.subject.name}
            </option>
          ))}
        </select>
        {errors.periodId?.message && (
          <p className="text-xs text-red-400">
            {errors.periodId.message.toString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("present")}
          defaultChecked={data?.present ?? false}
        />
        <label className="text-sm">Present</label>
      </div>

      {data && <input type="hidden" {...register("id")} value={data?.id} />}

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;
