/**
 * admin-push.js
 * Road Pro Carriers LLC — Driver Portal
 *
 * Adds a "Push to Portal" capability to the local admin pay dashboard.
 * Saves completed pay statements to Supabase so drivers can see them
 * when they log in to drivers.roadprocarriers.com.
 *
 * Usage: see integration snippet at the bottom of this file.
 */

// ─── Supabase config ────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://rfeakhvcjuidsgrjfubn.supabase.co';
const SUPABASE_ANON = 'sb_publishable_reHNLmo12w1HfOlDQW3ZbQ_5eqN5hN_';

// Lazy-init so the CDN script only needs to be loaded once on the page.
let _sb = null;
function getClient() {
  if (!_sb) {
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
      throw new Error(
        'Supabase JS is not loaded. Add the CDN script tag before admin-push.js.'
      );
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _sb;
}

// ─── Main export ─────────────────────────────────────────────────────────────
/**
 * pushStatementToPortal
 *
 * Looks up the driver in the `drivers` table by driver_id, then inserts
 * a new row into `pay_statements` linked to that driver's UUID.
 *
 * @param {Object} statement
 * @param {string}  statement.driver_first_name
 * @param {string}  statement.driver_last_name
 * @param {string}  statement.driver_id           - The human-readable driver ID (e.g. "RPC-001")
 * @param {string}  statement.pay_period_start     - ISO date string "YYYY-MM-DD"
 * @param {string}  statement.pay_period_end       - ISO date string "YYYY-MM-DD"
 * @param {number}  statement.loaded_miles
 * @param {number}  statement.empty_miles
 * @param {number}  statement.total_miles
 * @param {number}  statement.gross_pay
 * @param {Object}  statement.deductions           - Key/value pairs e.g. { "Fuel Advance": 200, "Escrow": 50 }
 * @param {number}  statement.net_pay
 * @param {string}  statement.pay_type             - "per_mile" | "flat_rate" | etc.
 * @param {number}  statement.rate                 - Rate per mile or flat rate amount
 * @param {Object}  statement.statement_data       - Full raw statement object for archiving
 */
async function pushStatementToPortal(statement) {
  const sb = getClient();

  // ── 1. Look up driver by driver_id ───────────────────────────────────────
  const { data: drivers, error: lookupErr } = await sb
    .from('drivers')
    .select('id, first_name, last_name, driver_id')
    .eq('driver_id', statement.driver_id)
    .limit(1);

  if (lookupErr) {
    alert('Error looking up driver: ' + lookupErr.message);
    return;
  }

  if (!drivers || drivers.length === 0) {
    alert(
      'Driver not found in portal. Ask HR to create this driver account first.'
    );
    return;
  }

  const driver = drivers[0];

  // ── 2. Build the pay_statements row ─────────────────────────────────────
  const row = {
    driver_id:        driver.id,                       // UUID FK → drivers.id
    pay_period_start: statement.pay_period_start,
    pay_period_end:   statement.pay_period_end,
    loaded_miles:     statement.loaded_miles   ?? statement.total_miles ?? 0,
    empty_miles:      statement.empty_miles    ?? 0,
    total_miles:      statement.total_miles    ?? statement.loaded_miles ?? 0,
    gross_pay:        statement.gross_pay,
    deductions:       statement.deductions     ?? {},
    net_pay:          statement.net_pay,
    pay_type:         statement.pay_type       ?? null,
    rate:             statement.rate           ?? null,
    statement_data:   statement.statement_data ?? statement,
    status:           'approved',
  };

  // ── 3. Insert into pay_statements ────────────────────────────────────────
  const { error: insertErr } = await sb
    .from('pay_statements')
    .insert(row);

  if (insertErr) {
    alert('Error pushing statement: ' + insertErr.message);
    return;
  }

  alert(
    'Statement pushed to driver portal successfully.\n\n' +
    'Driver: ' + driver.first_name + ' ' + driver.last_name + '\n' +
    'Period: ' + statement.pay_period_start + ' to ' + statement.pay_period_end
  );
}

// Expose globally so it can be called from inline onclick handlers
// in the existing local dashboard without needing ES module imports.
window.pushStatementToPortal = pushStatementToPortal;

/* ============================================================================
   INTEGRATION INSTRUCTIONS FOR THE LOCAL ADMIN PAY DASHBOARD
   ============================================================================

   1. ADD THESE TWO SCRIPT TAGS inside <head> or just before </body>
      (supabase CDN must come first):

      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
      <script src="admin-push.js"></script>

   ─────────────────────────────────────────────────────────────────────────────

   2. ADD THIS BUTTON to the pay statement section of your dashboard,
      wherever the Print / Download PDF button lives.
      Replace each placeholder value with the live variable name from
      your existing dashboard JavaScript:

      <button
        type="button"
        onclick="pushStatementToPortal({
          driver_first_name:  currentDriver.firstName,
          driver_last_name:   currentDriver.lastName,
          driver_id:          currentDriver.driverId,
          pay_period_start:   currentStatement.periodStart,
          pay_period_end:     currentStatement.periodEnd,
          loaded_miles:       currentStatement.loadedMiles,
          empty_miles:        currentStatement.emptyMiles,
          total_miles:        currentStatement.totalMiles,
          gross_pay:          currentStatement.grossPay,
          deductions:         currentStatement.deductions,
          net_pay:            currentStatement.netPay,
          pay_type:           currentDriver.payType,
          rate:               currentDriver.rate,
          statement_data:     currentStatement
        })"
        style="
          background: #2BC4A4;
          color: #ffffff;
          border: none;
          border-radius: 7px;
          padding: 10px 22px;
          font-family: Poppins, sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-left: 12px;
        "
      >
        &#x2601; Push to Portal
      </button>

   ─────────────────────────────────────────────────────────────────────────────

   3. IMPORTANT — match the field names above to whatever your local
      dashboard actually calls them. For example if your dashboard stores
      the driver object as `selectedDriver` and the period start as
      `weekStart`, update the onclick accordingly:

        driver_id:        selectedDriver.id,
        pay_period_start: weekStart,
        ...

   ============================================================================ */
