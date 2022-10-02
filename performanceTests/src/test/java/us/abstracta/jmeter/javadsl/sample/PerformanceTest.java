package us.abstracta.jmeter.javadsl.sample;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;


import static org.assertj.core.api.Assertions.assertThat;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;
import static us.abstracta.jmeter.javadsl.dashboard.DashboardVisualizer.*;

import java.io.File;
import java.io.IOException;
import java.time.Duration;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;

public class PerformanceTest {

  @Test
  public void testCategoriesWithMoreExpenses() throws IOException {
    String reportDir = "./report/testSimple";

    TestPlanStats stats = testPlan(
        threadGroup(
            2,
            2,
            httpSampler("https://api.expensify.ml/categories/expenses"),
            uniformRandomTimer(500, 2000)),
        dashboardVisualizer(),
        htmlReporter(reportDir)).run();
        long miliseconds=stats.overall().sampleTime().perc95().toMillis();
        long expected=Long.parseLong("300");
        assertTrue(miliseconds<=expected);
    

  } 
  @Test
  public void testCategories() throws IOException {
    String reportDir = "./report/testSimple";

    TestPlanStats stats = testPlan(
        threadGroup(
            2,
            2,
            httpSampler("https://api.expensify.ml/categories/expenses"),
            uniformRandomTimer(500, 2000)),
        dashboardVisualizer(),
        htmlReporter(reportDir)).run();
        long miliseconds=stats.overall().sampleTime().perc95().toMillis();
        long expected=Long.parseLong("300");
        assertTrue(miliseconds<=expected);
    

  }
}
