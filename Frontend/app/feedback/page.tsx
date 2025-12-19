"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, MessageSquare, Heart, Send } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    rating: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.length < 10)
      newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ subject: "", message: "", rating: 0 });
      }, 3000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center mr-5 ml-5 min-h-[400px] ">
          <Card className="w-full text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/5 to-purple-100/5 rounded-lg"></div>
            <CardContent className="relative pt-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-2">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your feedback has been received. We appreciate your input and
                will review it shortly.
              </p>
              <Button
                onClick={() => setShowSuccess(false)}
                className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
              >
                Submit Another Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-10 space-y-6">
        {/* Header */}
        
        <div className="mx-5">
          <div className="gradient-border">
            <Card className="gradient-border-content border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  We Value Your Opinion
                </CardTitle>
                <CardDescription>
                  Tell us about your experience or suggest improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your feedback"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${
                        errors.subject ? "border-red-500" : ""
                      }`}
                    />
                    {errors.subject && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.subject}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed feedback about your experience..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${
                        errors.message ? "border-red-500" : ""
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {formData.message.length}/10 characters minimum
                      </span>
                      <span>{formData.message.length}/500 characters</span>
                    </div>
                    {errors.message && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Rating (Optional)</Label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="focus:outline-none transition-all hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= formData.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                      {formData.rating > 0 && (
                        <span className="ml-3 text-sm text-muted-foreground">
                          {formData.rating} out of 5 stars
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({ subject: "", message: "", rating: 0 });
                        setErrors({});
                      }}
                      className="border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                    >
                      {isLoading ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-600"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Share Your Feedback
                </h1>
                <p className="text-purple-100">
                  Help us improve with your valuable insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
