import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FileTree = ({ data, onSelectFile, isDarkMode, collapseState, toggleCollapse }) => {
  const [hoveredFile, setHoveredFile] = useState(null);

  const renderTree = (items, parentPath = '') => {
    return items.map((item) => {
      const path = `${parentPath}/${item.name}`;
      const isCollapsed = collapseState[path] === false;

      if (item.type === 'folder') {
        return (
          <div key={path} className="ml-4">
            <div
              className={`flex items-center space-x-2 cursor-pointer p-1 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
              onClick={() => toggleCollapse(path)}
            >
              <span className="text-yellow-400">
                {isCollapsed ? '►' : '▼'}
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</span>
            </div>
            {!isCollapsed && (
              <div className="pl-4 border-l border-gray-500">
                {renderTree(item.children, path)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={path}
            className={`flex items-center space-x-2 p-1 rounded-md transition-colors duration-150 relative ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
            onMouseEnter={() => setHoveredFile(item.content)}
            onMouseLeave={() => setHoveredFile(null)}
            onClick={() => onSelectFile(item)}
          >
            <span className="text-blue-400">📄</span>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
            {hoveredFile === item.content && (
              <div className={`absolute left-full ml-2 z-10 p-2 rounded-md shadow-lg w-64 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-800 text-gray-100'}`}>
                <pre className="text-xs font-mono whitespace-pre-wrap">{item.content}</pre>
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className={`mt-4 p-2 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      {renderTree(data)}
    </div>
  );
};

FileTree.propTypes = {
  data: PropTypes.array.isRequired,
  onSelectFile: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  collapseState: PropTypes.object.isRequired,
  toggleCollapse: PropTypes.func.isRequired,
};

export default FileTree;