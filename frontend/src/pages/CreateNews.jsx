import Editor from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const CreateNews = () => {
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Create a News Article
      </h1>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            className="w-full sm:w-3/4  h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            type="text"
            placeholder="Title"
            required
            id="title"
          />
          <Select>
            <SelectTrigger className="w-full sm:w-1/4 h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="tree-plantation">Tree Plantation</SelectItem>
                <SelectItem value="donation-drive">Donation Drive</SelectItem>
                <SelectItem value="camp">Camp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3 ">
          <Input type="file" accept="image/*" />
          <Button className="bg-slate-700">Upload Image</Button>
        </div>
        <Editor
          theme="snow"
          placeholder="Write News here..."
          className=""
          required
        />

        <Button type="submit" className="h-12 bg-green-600 font-semibold max-sm:mt-5 text-md">Publish News</Button>
      </form>
    </div>
  );
};

export default CreateNews;
