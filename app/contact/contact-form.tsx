"use client";

import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { z } from "zod";

const requiredMessage = "This field is required";
const emailMessage = "Please use a valid email address";

const required: z.ZodType<string, string> = z.string().trim().min(1, { error: requiredMessage });
const email: z.ZodType<string, string> = z.string().trim().min(1, { error: requiredMessage, abort: true }).pipe(z.email({ error: emailMessage }));

/** The demo pauses briefly so the busy state is visible; nothing leaves the browser. */
const demoDelayMs = 700;

type FieldName = "name" | "email" | "message";
const fieldOrder: FieldName[] = ["name", "email", "message"];

function messageOf(error: unknown) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "";
}

export function ContactForm() {
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const [confirmed, setConfirmed] = useState("");
  const form = useForm({
    defaultValues: { name: "", email: "", message: "" },
    onSubmit: async ({ value, formApi }) => {
      await new Promise(resolve => setTimeout(resolve, demoDelayMs));
      setConfirmed(`Thanks, ${value.name.trim()}! Your message was checked on this page only. Nothing was sent.`);
      formApi.reset();
    },
    onSubmitInvalid: ({ formApi }) => {
      setConfirmed("");
      const first = fieldOrder.find(name => formApi.getFieldMeta(name)?.errors.length);
      if (first) refs.current[first]?.focus();
    },
  });

  return (
    <form
      className="contact-form"
      noValidate
      aria-labelledby="contact-me-title"
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        if (form.state.isSubmitting) return;
        void form.handleSubmit();
      }}
    >
      <form.Subscribe selector={state => state.submissionAttempts}>
        {attempts => (
          <>
            {([
              { name: "name", label: "Name", placeholder: "Jane Appleseed", schema: required, type: "text", autoComplete: "name" },
              { name: "email", label: "Email Address", placeholder: "email@example.com", schema: email, type: "email", autoComplete: "email" },
              { name: "message", label: "Message", placeholder: "How can I help?", schema: required, type: "textarea", autoComplete: "off" },
            ] as const).map(config => (
              <form.Field key={config.name} name={config.name} validators={{ onChange: config.schema, onSubmit: config.schema }}>
                {field => {
                  const error = attempts > 0 ? messageOf(field.state.meta.errors[0]) : "";
                  const errorId = `${config.name}-error`;
                  const shared = {
                    id: config.name,
                    name: config.name,
                    className: "field-control",
                    placeholder: config.placeholder,
                    value: field.state.value,
                    onBlur: field.handleBlur,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": error ? errorId : undefined,
                  } as const;
                  return (
                    <div className="field" data-invalid={error ? "true" : undefined}>
                      <label className="field-label" htmlFor={config.name}>{config.label}</label>
                      {config.type === "textarea" ? (
                        <textarea
                          {...shared}
                          ref={element => { refs.current[config.name] = element; }}
                          rows={3}
                          onChange={event => { setConfirmed(""); field.handleChange(event.target.value); }}
                        />
                      ) : (
                        <input
                          {...shared}
                          ref={element => { refs.current[config.name] = element; }}
                          type={config.type}
                          autoComplete={config.autoComplete}
                          onChange={event => { setConfirmed(""); field.handleChange(event.target.value); }}
                        />
                      )}
                      {error && <p id={errorId} className="field-error">{error}</p>}
                    </div>
                  );
                }}
              </form.Field>
            ))}
          </>
        )}
      </form.Subscribe>
      <p className="form-note">Demo only: nothing is sent.</p>
      <form.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <button type="submit" className="button-submit" aria-busy={isSubmitting || undefined}>
            {isSubmitting && <span className="spinner" aria-hidden="true" />}
            {isSubmitting ? "Checking…" : "Send Message"}
          </button>
        )}
      </form.Subscribe>
      <p className="form-status" role="status">{confirmed}</p>
    </form>
  );
}
