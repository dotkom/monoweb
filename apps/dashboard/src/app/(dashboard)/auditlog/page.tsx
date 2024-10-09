import React, { useEffect, useState } from 'react';
import { useAuditlogAllQuery } from 'src/modules/auditlog/queries/use-auditlog-all-query';

interface AuditLogEntry {
  id: number;
  action: string;
  user: string;
  timestamp: string;
}

const AuditLogPage: React.FC = () => {
  const { auditlogs, isLoading, isAuditlogsLoading } = useAuditlogAllQuery();
  return (
    <div>
      <h1>Audit Log</h1>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <td>fds</td>
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogPage;