"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    classes: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event ${type === "create" ? "created" : "updated"}!`);
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
        {type === "create" ? "Create Event" : "Update Event"}
      </h1>

      <InputField
        label="Title"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors.title}
      />

      <InputField
        label="Description"
        name="description"
        defaultValue={data?.description}
        register={register}
        error={errors.description}
      />

      <InputField
        label="Start Time"
        name="startTime"
        type="datetime-local"
        defaultValue={
          data?.startTime
            ? new Date(data.startTime).toISOString().slice(0, 16)
            : undefined
        }
        register={register}
        error={errors.startTime}
      />

      <InputField
        label="End Time"
        name="endTime"
        type="datetime-local"
        defaultValue={
          data?.endTime
            ? new Date(data.endTime).toISOString().slice(0, 16)
            : undefined
        }
        register={register}
        error={errors.endTime}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Class (optional)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("classId")}
          defaultValue={data?.classId ?? ""}
        >
          <option value="">All Classes</option>
          {relatedData?.classes?.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        {errors.classId?.message && (
          <p className="text-xs text-red-400">
            {errors.classId.message.toString()}
          </p>
        )}
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

export default EventForm;
