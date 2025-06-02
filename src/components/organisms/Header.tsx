import React from "react";
import { twMerge } from "tailwind-merge";
import { FiBell, FiUser, FiChevronDown } from "react-icons/fi";
import { SearchBar } from "../molecules/SearchBar";
import { Button } from "../atoms/Button";

interface HeaderProps {
  onSearch?: (value: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  user?: {
    name: string;
    avatar?: string;
  };
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNotificationClick,
  onProfileClick,
  user,
  className,
}) => {
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <header
      className={twMerge(
        "bg-white flex items-center justify-between w-full h-16 px-2 md:px-6",
        className
      )}
    >
      {/* Centered Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          <SearchBar
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search..."
          />
        </div>
      </div>
      {/* Right: Notification & User */}
      <div className="flex items-center space-x-4 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNotificationClick}
          className="relative"
        >
          <FiBell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="flex items-center space-x-2"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <FiUser className="w-5 h-5" />
          )}
          <span className="hidden md:inline-block text-sm font-medium">
            {user?.name || "User"}
          </span>
          <FiChevronDown className="w-4 h-4 text-gray-400 ml-1" />
        </Button>
      </div>
    </header>
  );
};
